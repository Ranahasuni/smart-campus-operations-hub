package com.smartcampus.dto;

import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.Role;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

public class BookingResponseDTO {
    private String id;
    private String userId;
    private String requesterName;
    private List<String> resourceIds;
    
    // Resource Details (Added)
    private List<String> resourceNames;
    private ResourceType resourceType; // Assuming same type for all in one request if simplified

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private BookingStatus status;
    private String purpose;
    private Integer expectedAttendees;
    private String rejectionReason;
    private String bookingCode;
    private Role requesterRole;
    private LocalDateTime createdAt;

    public BookingResponseDTO() {
    }

    public BookingResponseDTO(String id, String userId, String requesterName, List<String> resourceIds, List<String> resourceNames, ResourceType resourceType, LocalDate date, LocalTime startTime, LocalTime endTime, BookingStatus status, String purpose, Integer expectedAttendees, String rejectionReason, String bookingCode, Role requesterRole, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.requesterName = requesterName;
        this.resourceIds = resourceIds;
        this.resourceNames = resourceNames;
        this.resourceType = resourceType;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
        this.rejectionReason = rejectionReason;
        this.bookingCode = bookingCode;
        this.requesterRole = requesterRole;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public List<String> getResourceIds() { return resourceIds; }
    public void setResourceIds(List<String> resourceIds) { this.resourceIds = resourceIds; }

    public List<String> getResourceNames() { return resourceNames; }
    public void setResourceNames(List<String> resourceNames) { this.resourceNames = resourceNames; }

    public ResourceType getResourceType() { return resourceType; }
    public void setResourceType(ResourceType resourceType) { this.resourceType = resourceType; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public Integer getExpectedAttendees() { return expectedAttendees; }
    public void setExpectedAttendees(Integer expectedAttendees) { this.expectedAttendees = expectedAttendees; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public Role getRequesterRole() { return requesterRole; }
    public void setRequesterRole(Role requesterRole) { this.requesterRole = requesterRole; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static BookingResponseDTOBuilder builder() {
        return new BookingResponseDTOBuilder();
    }

    public static class BookingResponseDTOBuilder {
        private String id;
        private String userId;
        private String requesterName;
        private List<String> resourceIds;
        private List<String> resourceNames;
        private ResourceType resourceType;
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private BookingStatus status;
        private String purpose;
        private Integer expectedAttendees;
        private String rejectionReason;
        private String bookingCode;
        private Role requesterRole;
        private LocalDateTime createdAt;

        BookingResponseDTOBuilder() {}

        public BookingResponseDTOBuilder id(String id) { this.id = id; return this; }
        public BookingResponseDTOBuilder userId(String userId) { this.userId = userId; return this; }
        public BookingResponseDTOBuilder requesterName(String requesterName) { this.requesterName = requesterName; return this; }
        public BookingResponseDTOBuilder resourceIds(List<String> resourceIds) { this.resourceIds = resourceIds; return this; }
        public BookingResponseDTOBuilder resourceNames(List<String> resourceNames) { this.resourceNames = resourceNames; return this; }
        public BookingResponseDTOBuilder resourceType(ResourceType resourceType) { this.resourceType = resourceType; return this; }
        public BookingResponseDTOBuilder date(LocalDate date) { this.date = date; return this; }
        public BookingResponseDTOBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public BookingResponseDTOBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public BookingResponseDTOBuilder status(BookingStatus status) { this.status = status; return this; }
        public BookingResponseDTOBuilder purpose(String purpose) { this.purpose = purpose; return this; }
        public BookingResponseDTOBuilder expectedAttendees(Integer expectedAttendees) { this.expectedAttendees = expectedAttendees; return this; }
        public BookingResponseDTOBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public BookingResponseDTOBuilder bookingCode(String bookingCode) { this.bookingCode = bookingCode; return this; }
        public BookingResponseDTOBuilder requesterRole(Role requesterRole) { this.requesterRole = requesterRole; return this; }
        public BookingResponseDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public BookingResponseDTO build() {
            return new BookingResponseDTO(id, userId, requesterName, resourceIds, resourceNames, resourceType, date, startTime, endTime, status, purpose, expectedAttendees, rejectionReason, bookingCode, requesterRole, createdAt);
        }
    }
}
