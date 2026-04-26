package com.smartcampus.controller;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    // ── Member Endpoints ──────────────────────────────────────────────────────

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByResourceAndDate(
            @PathVariable String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getBookingsByResourceAndDate(resourceId, date));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "User context lost"));
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(dto, user.getId()));
    }

    @GetMapping("/user")
    public ResponseEntity<List<BookingResponseDTO>> getUserBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "User context lost"));
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId()));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "User context lost"));
        bookingService.cancelBooking(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "User context lost"));
        
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_LECTURER"));
                
        return ResponseEntity.ok(bookingService.getBookingByIdSecure(id, user.getId(), isAdmin));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "User context lost"));
        return ResponseEntity.ok(bookingService.updateBooking(id, dto, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "User context lost"));
        bookingService.deleteBooking(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    // ── Admin Endpoints (Moderation) ───────────────────────────────────────────

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookingsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(bookingService.getAllBookings(page, size));
    }

    @GetMapping("/staff/today")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getStaffTodaySchedule(
            @AuthenticationPrincipal UserDetails userDetails) {
        User staff = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED));
        return ResponseEntity.ok(bookingService.getStaffTodaySchedule(staff.getId()));
    }

    @GetMapping("/conflicts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<List<Booking>> getConflicts(@PathVariable String id) {
        Booking booking = bookingService.getBookingByIdRaw(id);
        return ResponseEntity.ok(bookingService.findConflicts(booking));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateDTO request) {
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(bookingService.updateBookingStatus(
            id, request.getStatus(), request.getReason(), adminId
        ));
    }

    public static class StatusUpdateDTO {
        private BookingStatus status;
        private String reason;

        public StatusUpdateDTO() {
        }

        public BookingStatus getStatus() { return status; }
        public void setStatus(BookingStatus status) { this.status = status; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
