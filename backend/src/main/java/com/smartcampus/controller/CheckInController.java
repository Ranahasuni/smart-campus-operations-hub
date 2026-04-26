package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.service.CheckInService;
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
public class CheckInController {

    private final CheckInService checkInService;
    private final UserRepository userRepository;

    public CheckInController(CheckInService checkInService, UserRepository userRepository) {
        this.checkInService = checkInService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{bookingId}")
    public ResponseEntity<?> checkIn(@PathVariable String bookingId) {
        return checkInService.checkInByBooking(bookingId);
    }

    @PostMapping("/resource/{resourceId}")
    public ResponseEntity<?> checkInByResource(@PathVariable String resourceId) {
        String campusId = SecurityContextHolder.getContext().getAuthentication().getName();
        return checkInService.checkInByResource(resourceId, campusId);
    }

    @GetMapping("/{bookingId}/status")
    public ResponseEntity<?> getCheckInStatus(@PathVariable String bookingId) {
        return ResponseEntity.ok(checkInService.getCheckInStatus(bookingId));
    }

    @PostMapping("/{bookingId}/report-missing-qr")
    public ResponseEntity<?> reportMissingQR(@PathVariable String bookingId) {
        String campusId = SecurityContextHolder.getContext().getAuthentication().getName();
        return checkInService.reportMissingQR(bookingId, campusId);
    }

    @PostMapping("/verify-qr")
    public ResponseEntity<?> verifyQR(@RequestBody Map<String, String> payload) {
        String bookingCode = payload.get("bookingCode");
        String staffCampusId = SecurityContextHolder.getContext().getAuthentication().getName();
        
        User staff = userRepository.findByCampusId(staffCampusId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED));
                
        return checkInService.verifyQR(bookingCode, staff.getId());
    }
}
