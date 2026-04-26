package com.smartcampus.dto;

import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponseDTO {
    private String id;
    private String userId;
    private String requesterName;
    private java.util.List<String> resourceIds;
    
    // Resource Details (Added)
    private java.util.List<String> resourceNames;
    private ResourceType resourceType; // Assuming same type for all in one request if simplified

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private BookingStatus status;
    private String purpose;
    private Integer expectedAttendees;
    private String rejectionReason;
    private String bookingCode;
    private com.smartcampus.model.Role requesterRole;
    private LocalDateTime createdAt;
}
