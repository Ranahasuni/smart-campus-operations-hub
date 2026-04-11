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
    private java.util.List<String> resourceIds;

    // Booking time slots
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

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

    private String bookingCode;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
