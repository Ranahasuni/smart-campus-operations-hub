package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private List<String> resourceIds = new ArrayList<>();

    @Indexed
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @Indexed
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
    private List<String> selectedEquipment = new ArrayList<>();

    // Financials
    private Double totalFee;
    private boolean isPaid;
    private LocalDateTime paymentDeadline;

    /** Only filled if status = REJECTED */
    private String rejectionReason;

    private boolean isCheckedIn = false;
    private LocalDateTime checkInTime;

    private String bookingCode;

    @Indexed
    private LocalDateTime createdAt = LocalDateTime.now();

    public Booking() {
    }

    public Booking(String id, String userId, List<String> resourceIds, LocalDate date, LocalTime startTime, LocalTime endTime, BookingStatus status, String purpose, Integer expectedAttendees, boolean isExternalUser, String organizationName, boolean isNonProfit, String publicLiabilityInsuranceUrl, String emergencyContact, String eventSchedule, String riskAssessment, boolean cateringRequired, List<String> selectedEquipment, Double totalFee, boolean isPaid, LocalDateTime paymentDeadline, String rejectionReason, boolean isCheckedIn, LocalDateTime checkInTime, String bookingCode, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.resourceIds = resourceIds != null ? resourceIds : new ArrayList<>();
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status != null ? status : BookingStatus.PENDING;
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
        this.isExternalUser = isExternalUser;
        this.organizationName = organizationName;
        this.isNonProfit = isNonProfit;
        this.publicLiabilityInsuranceUrl = publicLiabilityInsuranceUrl;
        this.emergencyContact = emergencyContact;
        this.eventSchedule = eventSchedule;
        this.riskAssessment = riskAssessment;
        this.cateringRequired = cateringRequired;
        this.selectedEquipment = selectedEquipment != null ? selectedEquipment : new ArrayList<>();
        this.totalFee = totalFee;
        this.isPaid = isPaid;
        this.paymentDeadline = paymentDeadline;
        this.rejectionReason = rejectionReason;
        this.isCheckedIn = isCheckedIn;
        this.checkInTime = checkInTime;
        this.bookingCode = bookingCode;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<String> getResourceIds() { return resourceIds; }
    public void setResourceIds(List<String> resourceIds) { this.resourceIds = resourceIds; }

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

    public Double getTotalFee() { return totalFee; }
    public void setTotalFee(Double totalFee) { this.totalFee = totalFee; }

    public boolean isPaid() { return isPaid; }
    public void setPaid(boolean paid) { isPaid = paid; }

    public LocalDateTime getPaymentDeadline() { return paymentDeadline; }
    public void setPaymentDeadline(LocalDateTime paymentDeadline) { this.paymentDeadline = paymentDeadline; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public boolean isCheckedIn() { return isCheckedIn; }
    public void setCheckedIn(boolean checkedIn) { isCheckedIn = checkedIn; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Booking booking = (Booking) o;
        return Objects.equals(id, booking.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Booking{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", status=" + status +
                '}';
    }

    public static BookingBuilder builder() {
        return new BookingBuilder();
    }

    public static class BookingBuilder {
        private String id;
        private String userId;
        private List<String> resourceIds = new ArrayList<>();
        private LocalDate date;
        private LocalTime startTime;
        private LocalTime endTime;
        private BookingStatus status = BookingStatus.PENDING;
        private String purpose;
        private Integer expectedAttendees;
        private boolean isExternalUser;
        private String organizationName;
        private boolean isNonProfit;
        private String publicLiabilityInsuranceUrl;
        private String emergencyContact;
        private String eventSchedule;
        private String riskAssessment;
        private boolean cateringRequired;
        private List<String> selectedEquipment = new ArrayList<>();
        private Double totalFee;
        private boolean isPaid;
        private LocalDateTime paymentDeadline;
        private String rejectionReason;
        private boolean isCheckedIn = false;
        private LocalDateTime checkInTime;
        private String bookingCode;
        private LocalDateTime createdAt = LocalDateTime.now();

        BookingBuilder() {}

        public BookingBuilder id(String id) { this.id = id; return this; }
        public BookingBuilder userId(String userId) { this.userId = userId; return this; }
        public BookingBuilder resourceIds(List<String> resourceIds) { this.resourceIds = resourceIds; return this; }
        public BookingBuilder date(LocalDate date) { this.date = date; return this; }
        public BookingBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public BookingBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public BookingBuilder status(BookingStatus status) { this.status = status; return this; }
        public BookingBuilder purpose(String purpose) { this.purpose = purpose; return this; }
        public BookingBuilder expectedAttendees(Integer expectedAttendees) { this.expectedAttendees = expectedAttendees; return this; }
        public BookingBuilder isExternalUser(boolean isExternalUser) { this.isExternalUser = isExternalUser; return this; }
        public BookingBuilder organizationName(String organizationName) { this.organizationName = organizationName; return this; }
        public BookingBuilder isNonProfit(boolean isNonProfit) { this.isNonProfit = isNonProfit; return this; }
        public BookingBuilder publicLiabilityInsuranceUrl(String publicLiabilityInsuranceUrl) { this.publicLiabilityInsuranceUrl = publicLiabilityInsuranceUrl; return this; }
        public BookingBuilder emergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; return this; }
        public BookingBuilder eventSchedule(String eventSchedule) { this.eventSchedule = eventSchedule; return this; }
        public BookingBuilder riskAssessment(String riskAssessment) { this.riskAssessment = riskAssessment; return this; }
        public BookingBuilder cateringRequired(boolean cateringRequired) { this.cateringRequired = cateringRequired; return this; }
        public BookingBuilder selectedEquipment(List<String> selectedEquipment) { this.selectedEquipment = selectedEquipment; return this; }
        public BookingBuilder totalFee(Double totalFee) { this.totalFee = totalFee; return this; }
        public BookingBuilder isPaid(boolean isPaid) { this.isPaid = isPaid; return this; }
        public BookingBuilder paymentDeadline(LocalDateTime paymentDeadline) { this.paymentDeadline = paymentDeadline; return this; }
        public BookingBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public BookingBuilder isCheckedIn(boolean isCheckedIn) { this.isCheckedIn = isCheckedIn; return this; }
        public BookingBuilder checkInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; return this; }
        public BookingBuilder bookingCode(String bookingCode) { this.bookingCode = bookingCode; return this; }
        public BookingBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Booking build() {
            return new Booking(id, userId, resourceIds, date, startTime, endTime, status, purpose, expectedAttendees, isExternalUser, organizationName, isNonProfit, publicLiabilityInsuranceUrl, emergencyContact, eventSchedule, riskAssessment, cateringRequired, selectedEquipment, totalFee, isPaid, paymentDeadline, rejectionReason, isCheckedIn, checkInTime, bookingCode, createdAt);
        }
    }
}
