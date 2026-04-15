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
+@CrossOrigin(origins = "*")
+public class CheckInController {
+
+    private final BookingRepository bookingRepository;
+
+    @PostMapping("/{bookingId}")
+    public ResponseEntity<?> checkIn(@PathVariable String bookingId) {
+        // Placeholder for logic
+        return ResponseEntity.ok(Map.of("message", "Ready to implement check-in logic"));
+    }
+}
+
