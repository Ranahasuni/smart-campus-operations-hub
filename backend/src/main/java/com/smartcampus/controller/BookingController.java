package com.smartcampus.controller;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    /**
     * Fetch existing bookings for a specific resource on a given date.
     * GET /api/bookings/resource/{resourceId}?date=2024-05-20
     */
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByResourceAndDate(
            @PathVariable String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        return ResponseEntity.ok(bookingService.getBookingsByResourceAndDate(resourceId, date));
    }

    /**
     * Create a new booking request.
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User context lost"));
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bookingService.createBooking(dto, user.getId()));
    }
}
