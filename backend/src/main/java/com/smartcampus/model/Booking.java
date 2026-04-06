package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    // References to other collections
    private String userId;
    private String resourceId;

    // Booking time slots
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String purpose;

    private Integer expectedAttendees;
    /** Only filled if status = REJECTED */
    private String rejectionReason;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
