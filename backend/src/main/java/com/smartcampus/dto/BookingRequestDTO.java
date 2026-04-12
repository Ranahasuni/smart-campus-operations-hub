package com.smartcampus.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BookingRequestDTO {
    
    @NotNull(message = "Resource selection is required")
    private java.util.List<String> resourceIds;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @Min(value = 1, message = "At least one attendee is required")
    private Integer expectedAttendees;

    // Griffith Specific
    private boolean isExternalUser;
    private String organizationName;
    private boolean isNonProfit;
    private String publicLiabilityInsuranceUrl;
    
    private String emergencyContact;
    private String eventSchedule;
    private String riskAssessment;

    private boolean cateringRequired;
    private java.util.List<String> selectedEquipment;
}
