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
    
    @org.springframework.data.mongodb.core.index.Indexed
    private String userId;
    
    @org.springframework.data.mongodb.core.index.Indexed
    private java.util.List<String> resourceIds;

    @org.springframework.data.mongodb.core.index.Indexed
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @org.springframework.data.mongodb.core.index.Indexed
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String purpose;
    private Integer expectedAttendees;

    // Additional Griffith Requirements
    private boolean isExternalUser;
    private String organizationName;
    private boolean isNonProfit;
    private String publicLiabilityInsuranceUrl;
    
    // Event Plan Details
    private String emergencyContact;
    private String eventSchedule;
    private String riskAssessment;

    private boolean cateringRequired;
    private java.util.List<String> selectedEquipment;

    // Financials
    private Double totalFee;
    private boolean isPaid;
    private LocalDateTime paymentDeadline;

    /** Only filled if status = REJECTED */
    private String rejectionReason;

    @Builder.Default
    private boolean isCheckedIn = false;
    private LocalDateTime checkInTime;

    private String bookingCode;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
