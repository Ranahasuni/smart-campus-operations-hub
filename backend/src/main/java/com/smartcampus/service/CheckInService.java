package com.smartcampus.service;

import com.smartcampus.model.*;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.config.CheckInProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckInService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketService ticketService;
    private final NotificationService notificationService;
    private final CheckInProperties checkInProperties;

    public ResponseEntity<?> checkInByBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        validateBookingForCheckIn(booking);
        
        return performCheckIn(booking);
    }

    public ResponseEntity<?> checkInByResource(String resourceId, String campusId) {
        User user = userRepository.findByCampusId(campusId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Booking> activeBookings = bookingRepository.findByUserId(user.getId()).stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .filter(b -> b.getDate().equals(today))
                .filter(b -> b.getResourceIds().contains(resourceId))
                .filter(b -> !b.isCheckedIn())
                .filter(b -> !now.isBefore(b.getStartTime().minusMinutes(checkInProperties.getScanBufferMinutes())) && !now.isAfter(b.getEndTime()))
                .toList();

        if (activeBookings.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "No active booking found for this resource at this time.",
                "message", "Please ensure you have an approved reservation for this time slot."
            ));
        }

        return performCheckIn(activeBookings.get(0));
    }

    public ResponseEntity<?> reportMissingQR(String bookingId, String campusId) {
        User reporter = userRepository.findByCampusId(campusId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(reporter.getId())) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized: You do not own this reservation."));
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Only approved bookings can be verified."));
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        boolean isArriving = booking.getDate().equals(today) && 
                            !now.isBefore(booking.getStartTime().minusMinutes(checkInProperties.getManualBufferMinutes())) && 
                            !now.isAfter(booking.getEndTime());

        ResponseEntity<?> checkInResponse = null;
        if (isArriving) {
            checkInResponse = performCheckIn(booking);
        }

        raiseAutomatedTicket(booking, reporter, isArriving);

        if (checkInResponse != null) return checkInResponse;
        
        return ResponseEntity.ok(Map.of(
            "message", "Issue reported successfully. Technical staff notified.",
            "status", "REPORTED_ONLY"
        ));
    }

    private void validateBookingForCheckIn(Booking booking) {
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved bookings can be checked in.");
        }

        if (booking.isCheckedIn()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already checked in.");
        }

        if (!booking.getDate().equals(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-in failed. Booking date mismatch.");
        }
    }

    private ResponseEntity<?> performCheckIn(Booking booking) {
        booking.setCheckedIn(true);
        booking.setCheckInTime(LocalDateTime.now());
        bookingRepository.save(booking);

        try {
            notificationService.notifyCheckIn(booking.getUserId(), booking.getId(), booking.getBookingCode());
        } catch (Exception e) {
            log.warn("Failed to send check-in notification for booking {}: {}", booking.getId(), e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
            "message", "Verification Successful",
            "checkInTime", booking.getCheckInTime(),
            "bookingCode", booking.getBookingCode(),
            "status", "CHECKED_IN"
        ));
    }

    private void raiseAutomatedTicket(Booking booking, User reporter, boolean isArriving) {
        try {
            String primaryResourceId = booking.getResourceIds().get(0);
            Resource res = resourceRepository.findById(primaryResourceId).orElse(null);
            String name = (res != null) ? res.getName() : "Unknown";
            String loc = (res != null) ? res.getLocation() : "Unknown";

            Ticket ticket = Ticket.builder()
                .userId(reporter.getId())
                .userFullName(reporter.getFullName())
                .userCampusId(reporter.getCampusId())
                .resourceId(primaryResourceId)
                .title("CHECK-IN ISSUE: " + name)
                .issueType(IssueType.OTHER)
                .priority(Priority.HIGH)
                .description("Automated report for " + loc + ". Reason: Potential signage/camera issue. Status: " + (isArriving ? "Checked in." : "Reported early."))
                .status(TicketStatus.OPEN)
                .build();

            ticketService.createTicket(ticket);
        } catch (Exception e) {
            log.error("Failed to raise automated ticket: {}", e.getMessage());
        }
    }
}
