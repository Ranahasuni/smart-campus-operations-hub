package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.User;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.AuthService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * BookingController — Administrative and Citizen moderate endpoints for campus resource reservations.
 * Standardized to /api/bookings for consistency with our gateway architecture.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT') or hasRole('LECTURER')")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/conflicts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getConflicts(@PathVariable String id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(bookingService.findConflicts(booking));
    }

    /**
     * Moderation Endpoint: Approves or Rejects a campus reservation.
     * Core requirement for AdminReviewPage.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateDTO request) {
        
        // Audit: Identify which Admin is performing this moderation
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        
        return ResponseEntity.ok(bookingService.updateBookingStatus(
            id, 
            request.getStatus(), 
            request.getReason(), 
            adminId
        ));
    }

    @Data
    public static class StatusUpdateDTO {
        private BookingStatus status;
        private String reason;
    }
}
