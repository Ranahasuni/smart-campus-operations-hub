package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartcampus.service.TicketService;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.IssueType;
import com.smartcampus.model.Priority;
import com.smartcampus.model.TicketStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.model.User;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/check-in")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CheckInController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketService ticketService;
    private final com.smartcampus.service.NotificationService notificationService;

    @PostMapping("/{bookingId}")
    public ResponseEntity<?> checkIn(@PathVariable String bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }

        if (booking.getStatus() != com.smartcampus.model.BookingStatus.APPROVED) {
            return ResponseEntity.status(400).body(Map.of("error", "Only approved bookings can be checked in. Current status: " + booking.getStatus()));
        }

        if (booking.isCheckedIn()) {
            return ResponseEntity.status(400).body(Map.of("error", "This booking has already been checked in at " + booking.getCheckInTime()));
        }

        LocalDate today = LocalDate.now();
        if (!booking.getDate().equals(today)) {
            return ResponseEntity.status(400).body(Map.of("error", "Check-in failed. Booking is for " + booking.getDate() + ", but today is " + today));
        }

        booking.setCheckedIn(true);
        booking.setCheckInTime(LocalDateTime.now());
        bookingRepository.save(booking);

        // Notify user of successful check-in
        try {
            notificationService.notifyCheckIn(
                booking.getUserId(),
                booking.getId(),
                booking.getBookingCode()
            );
        } catch (Exception e) {
            // Log error but don't fail the check-in
        }

        return performCheckIn(booking);
    }

    @PostMapping("/resource/{resourceId}")
    public ResponseEntity<?> checkInByResource(@PathVariable String resourceId) {
        String campusId = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByCampusId(campusId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 1. Find an APPROVED booking for this user and resource on this date
        // Note: A booking might contain multiple resource IDs
        List<Booking> activeBookings = bookingRepository.findByUserId(user.getId()).stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .filter(b -> b.getDate().equals(today))
                .filter(b -> b.getResourceIds().contains(resourceId))
                .filter(b -> !b.isCheckedIn())
                // Allow check-in: 15 mins before start until end of booking
                .filter(b -> !now.isBefore(b.getStartTime().minusMinutes(15)) && !now.isAfter(b.getEndTime()))
                .toList();

        if (activeBookings.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of(
                "error", "No active booking found for this resource at this time.",
                "message", "Please ensure you have an approved reservation for this time slot."
            ));
        }

        // 2. Perform check-in for the first matching booking
        return performCheckIn(activeBookings.get(0));
    }

    @PostMapping("/{bookingId}/report-missing-qr")
    public ResponseEntity<?> reportMissingQR(@PathVariable String bookingId) {
        String campusId = SecurityContextHolder.getContext().getAuthentication().getName();
        User reporter = userRepository.findByCampusId(campusId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(reporter.getId())) {
             return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: You do not own this reservation."));
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            return ResponseEntity.status(400).body(Map.of("error", "Only approved bookings can be verified."));
        }

        // 1. Perform Check-In
        ResponseEntity<?> checkInResponse = performCheckIn(booking);

        // 2. Automated Ticket Creation
        try {
            // Get the first resource ID (most common) or join them
            String primaryResourceId = booking.getResourceIds().get(0);
            Resource res = resourceRepository.findById(primaryResourceId).orElse(null);
            
            String resourceName = (res != null) ? res.getName() : "Unknown Facility";
            String location = (res != null) ? res.getLocation() : "Unknown Location";

            Ticket ticket = Ticket.builder()
                .userId(reporter.getId())
                .userFullName(reporter.getFullName())
                .userCampusId(reporter.getCampusId())
                .resourceId(primaryResourceId)
                .title("URGENT: Missing QR Signage - " + resourceName)
                .issueType(IssueType.OTHER)
                .priority(Priority.HIGH)
                .description("Automated report: QR code signage at " + location + " is missing or unreadable. " +
                             "The reporter was checked in manually via fallback. Please replace physical signage.")
                .status(TicketStatus.OPEN)
                .build();

            ticketService.createTicket(ticket);
        } catch (Exception e) {
            System.err.println("Failed to raise automated QR ticket: " + e.getMessage());
        }

        return checkInResponse;
    }

    private ResponseEntity<?> performCheckIn(Booking booking) {
        booking.setCheckedIn(true);
        booking.setCheckInTime(LocalDateTime.now());
        bookingRepository.save(booking);

        try {
            notificationService.notifyCheckIn(
                booking.getUserId(),
                booking.getId(),
                booking.getBookingCode()
            );
        } catch (Exception e) {}

        return ResponseEntity.ok(Map.of(
            "message", "Verification Successful",
            "checkInTime", booking.getCheckInTime(),
            "bookingCode", booking.getBookingCode(),
            "status", "CHECKED_IN"
        ));
    }
}
