package com.smartcampus.controller;
+
+import com.smartcampus.model.Booking;
+import com.smartcampus.model.BookingStatus;
+import com.smartcampus.repository.BookingRepository;
+import lombok.RequiredArgsConstructor;
+import org.springframework.http.ResponseEntity;
+import org.springframework.web.bind.annotation.*;
+
+import java.time.LocalDate;
+import java.time.LocalDateTime;
+import java.time.LocalTime;
+import java.util.Map;
+
+@RestController
+@RequestMapping("/api/check-in")
+@RequiredArgsConstructor

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/check-in")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CheckInController {

    private final BookingRepository bookingRepository;

    @PostMapping("/{bookingId}")
    public ResponseEntity<?> checkIn(@PathVariable String bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            return ResponseEntity.status(400).body(Map.of("error", "Only approved bookings can be checked in. Current status: " + booking.getStatus()));
        }

        if (booking.isCheckedIn()) {
            return ResponseEntity.status(400).body(Map.of("error", "This booking has already been checked in at " + booking.getCheckInTime()));
        }

        LocalDate today = LocalDate.now();
        if (!booking.getDate().equals(today)) {
            return ResponseEntity.status(400).body(Map.of("error", "Check-in failed. Booking is for " + booking.getDate() + ", but today is " + today));
        }

        return ResponseEntity.ok(Map.of("message", "Validation successful"));
    }
}
