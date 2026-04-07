package com.smartcampus.controller;

import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

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
}
