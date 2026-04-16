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
    
    @jakarta.validation.constraints.NotEmpty(message = "Resource selection is required")
    @jakarta.validation.constraints.Size(max = 5, message = "Maximum of 5 resources per booking request")
    private java.util.List<String> resourceIds;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    @jakarta.validation.constraints.Size(min = 5, max = 500, message = "Purpose must be between 5 and 500 characters")
    private String purpose;

    @NotNull(message = "Attendee count is required")
    @Min(value = 1, message = "At least one attendee is required")
    private Integer expectedAttendees;

    // Griffith Specific
    private boolean isExternalUser;
    
    @jakarta.validation.constraints.Size(max = 100)
    private String organizationName;
    
    private boolean isNonProfit;
    private String publicLiabilityInsuranceUrl;
    
    @jakarta.validation.constraints.Size(max = 200, message = "Emergency contact details are too long")
    private String emergencyContact;
    
    @jakarta.validation.constraints.Size(max = 2000)
    private String eventSchedule;
    
    @jakarta.validation.constraints.Size(max = 2000)
    private String riskAssessment;

    private boolean cateringRequired;
    private java.util.List<String> selectedEquipment;
}
