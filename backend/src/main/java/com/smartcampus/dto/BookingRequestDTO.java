package com.smartcampus.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class BookingRequestDTO {
    
    @NotEmpty(message = "Resource selection is required")
    @Size(max = 5, message = "Maximum of 5 resources per booking request")
    private List<String> resourceIds;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    @Size(min = 5, max = 500, message = "Purpose must be between 5 and 500 characters")
    private String purpose;

    @NotNull(message = "Attendee count is required")
    @Min(value = 1, message = "At least one attendee is required")
    private Integer expectedAttendees;

    // Griffith Specific
    private boolean isExternalUser;
    
    @Size(max = 100)
    private String organizationName;
    
    private boolean isNonProfit;
    private String publicLiabilityInsuranceUrl;
    
    @Size(max = 200, message = "Emergency contact details are too long")
    private String emergencyContact;
    
    @Size(max = 2000)
    private String eventSchedule;
    
    @Size(max = 2000)
    private String riskAssessment;

    private boolean cateringRequired;
    private List<String> selectedEquipment;

    public BookingRequestDTO() {
    }

    // Getters and Setters
    public List<String> getResourceIds() { return resourceIds; }
    public void setResourceIds(List<String> resourceIds) { this.resourceIds = resourceIds; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public Integer getExpectedAttendees() { return expectedAttendees; }
    public void setExpectedAttendees(Integer expectedAttendees) { this.expectedAttendees = expectedAttendees; }

    public boolean isExternalUser() { return isExternalUser; }
    public void setExternalUser(boolean externalUser) { isExternalUser = externalUser; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public boolean isNonProfit() { return isNonProfit; }
    public void setNonProfit(boolean nonProfit) { isNonProfit = nonProfit; }

    public String getPublicLiabilityInsuranceUrl() { return publicLiabilityInsuranceUrl; }
    public void setPublicLiabilityInsuranceUrl(String publicLiabilityInsuranceUrl) { this.publicLiabilityInsuranceUrl = publicLiabilityInsuranceUrl; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getEventSchedule() { return eventSchedule; }
    public void setEventSchedule(String eventSchedule) { this.eventSchedule = eventSchedule; }

    public String getRiskAssessment() { return riskAssessment; }
    public void setRiskAssessment(String riskAssessment) { this.riskAssessment = riskAssessment; }

    public boolean isCateringRequired() { return cateringRequired; }
    public void setCateringRequired(boolean cateringRequired) { this.cateringRequired = cateringRequired; }

    public List<String> getSelectedEquipment() { return selectedEquipment; }
    public void setSelectedEquipment(List<String> selectedEquipment) { this.selectedEquipment = selectedEquipment; }
}
