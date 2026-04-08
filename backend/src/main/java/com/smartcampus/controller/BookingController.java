package com.smartcampus.controller;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    // ── Member Endpoints ──────────────────────────────────────────────────────

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByResourceAndDate(
            @PathVariable String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getBookingsByResourceAndDate(resourceId, date));
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User context lost"));
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(dto, user.getId()));
    }

    @GetMapping("/user")
    public ResponseEntity<List<BookingResponseDTO>> getUserBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User context lost"));
        return ResponseEntity.ok(bookingService.getUserBookings(user.getId()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User context lost"));
        bookingService.cancelBooking(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User context lost"));
        
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                
        return ResponseEntity.ok(bookingService.getBookingByIdSecure(id, user.getId(), isAdmin));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User context lost"));
        return ResponseEntity.ok(bookingService.updateBooking(id, dto, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User context lost"));
        bookingService.deleteBooking(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    // ── Admin Endpoints (Moderation) ───────────────────────────────────────────

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookingsAdmin() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/conflicts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getConflicts(@PathVariable String id) {
        Booking booking = bookingService.getBookingByIdRaw(id);
        return ResponseEntity.ok(bookingService.findConflicts(booking));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateDTO request) {
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(bookingService.updateBookingStatus(
            id, request.getStatus(), request.getReason(), adminId
        ));
    }

    @Data
    public static class StatusUpdateDTO {
        private BookingStatus status;
        private String reason;
    }
}
