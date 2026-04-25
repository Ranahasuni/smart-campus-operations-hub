package com.smartcampus.service;

import com.smartcampus.model.*;
import java.util.Optional;
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
    private final AuditService auditService;

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

        List<BookingStatus> allowedStatuses = List.of(BookingStatus.APPROVED);
        List<Booking> activeBookings = bookingRepository.findByUserIdAndDateAndStatusIn(user.getId(), today, allowedStatuses).stream()
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
        auditService.log(reporter.getId(), "ISSUE_REPORT", "Reported missing QR for booking " + bookingId + " at Facility " + booking.getResourceIds());

        if (checkInResponse != null) return checkInResponse;
        
        return ResponseEntity.ok(Map.of(
            "message", "Issue reported successfully. Technical staff notified.",
            "status", "REPORTED_ONLY"
        ));
    }

    public Map<String, Object> getCheckInStatus(String bookingId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) return Map.of("eligible", false, "reason", "Booking not found");
        
        Booking booking = bookingOpt.get();
        if (booking.isCheckedIn() || booking.getStatus() == BookingStatus.CHECKED_IN) {
            return Map.of("eligible", false, "reason", "ALREADY_CHECKED_IN", "time", booking.getCheckInTime());
        }
        
        // Use a more inclusive check if needed, but standard is APPROVED
        if (booking.getStatus() != BookingStatus.APPROVED) {
            return Map.of("eligible", false, "reason", "NOT_APPROVED", "status", booking.getStatus());
        }
        
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        
        if (!booking.getDate().equals(today)) {
            return Map.of("eligible", false, "reason", "WRONG_DATE", "bookingDate", booking.getDate());
        }
        
        boolean tooEarly = now.isBefore(booking.getStartTime().minusMinutes(checkInProperties.getScanBufferMinutes()));
        boolean tooLate = now.isAfter(booking.getEndTime());
        
        if (tooEarly) return Map.of("eligible", false, "reason", "TOO_EARLY", "startTime", booking.getStartTime());
        if (tooLate) return Map.of("eligible", false, "reason", "TOO_LATE", "endTime", booking.getEndTime());
        
        return Map.of("eligible", true, "message", "Ready for check-in");
    }

    private void validateBookingForCheckIn(Booking booking) {
        Map<String, Object> status = getCheckInStatus(booking.getId());
        if (!(Boolean) status.get("eligible")) {
            String reason = (String) status.get("reason");
            String message = reason;
            if ("ALREADY_CHECKED_IN".equals(reason)) message = "User is already checked in.";
            if ("TOO_EARLY".equals(reason)) message = "Arrival verification only possible within " + checkInProperties.getScanBufferMinutes() + " minutes of start time.";
            if ("TOO_LATE".equals(reason)) message = "Check-in failed. This booking time has already ended.";
            if ("WRONG_DATE".equals(reason)) message = "Check-in failed. This booking is for " + status.get("bookingDate");
            
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    public ResponseEntity<?> verifyQR(String bookingCode, String staffUserId) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid QR Code: Booking not found."));

        User staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        validateBookingForCheckIn(booking);

        // Verify Staff Assignment for the specific resource
        boolean isAuthorized = staff.getRole() == Role.ADMIN;
        if (!isAuthorized) {
            String primaryResourceId = booking.getResourceIds().get(0);
            Resource resource = resourceRepository.findById(primaryResourceId).orElse(null);
            if (resource != null && resource.getAssignedStaffId() != null) {
                isAuthorized = resource.getAssignedStaffId().equals(staffUserId);
            }
        }

        if (!isAuthorized) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "Unauthorized",
                "message", "You are not assigned to manage this facility."
            ));
        }

        return performCheckIn(booking);
    }

    private ResponseEntity<?> performCheckIn(Booking booking) {
        booking.setCheckedIn(true);
        booking.setCheckInTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.CHECKED_IN); // Key update
        bookingRepository.save(booking);

        auditService.log(booking.getUserId(), "CHECK_IN", "Staff verified student arrival for booking " + booking.getId() + " (" + booking.getBookingCode() + ")");

        try {
            notificationService.notifyCheckIn(booking.getUserId(), booking.getId(), booking.getBookingCode());
        } catch (Exception e) {
            log.warn("Failed to send check-in notification for booking {}: {}", booking.getId(), e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
            "message", "Verification Successful",
            "checkInTime", booking.getCheckInTime(),
            "bookingCode", booking.getBookingCode(),
            "status", "CHECKED_IN",
            "fullName", userRepository.findById(booking.getUserId()).map(User::getFullName).orElse("Student")
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
