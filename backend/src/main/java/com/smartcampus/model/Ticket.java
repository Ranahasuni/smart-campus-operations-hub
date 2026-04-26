package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Objects;

@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    @Indexed
    private String userId; // User who created the ticket
    private String userFullName;
    private String userCampusId;
    private String displayId; // Human-readable sequential ID (e.g. #TKT-1001)
    @Indexed
    private String resourceId; // The broken resource

    private String title;
    private IssueType issueType;
    private String description;

    // --- Top Marks Feature ---
    private String contactDetails;
    private String locationDetail; // e.g. "Second row, desk 3"
    // -------------------------

    @Indexed
    private TicketStatus status = TicketStatus.OPEN;

    @Indexed
    private Priority priority;

    private String technicianId; // Assigned technician
    private String technicianFullName;
    private String technicianCampusId;
    private String assignmentMethod; // e.g. "ADMIN_ASSIGNED", "SELF_CLAIMED"

    // --- Top Marks Feature ---
    private String resolutionNotes;
    private String rejectionReason;
    // -------------------------

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    // --- SLA Timer Features ---
    private LocalDateTime assignedAt;
    private LocalDateTime resolvedAt;

    public Ticket() {
    }

    public Ticket(String id, String userId, String userFullName, String userCampusId, String displayId, String resourceId, String title, IssueType issueType, String description, String contactDetails, String locationDetail, TicketStatus status, Priority priority, String technicianId, String technicianFullName, String technicianCampusId, String assignmentMethod, String resolutionNotes, String rejectionReason, LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime assignedAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.userId = userId;
        this.userFullName = userFullName;
        this.userCampusId = userCampusId;
        this.displayId = displayId;
        this.resourceId = resourceId;
        this.title = title;
        this.issueType = issueType;
        this.description = description;
        this.contactDetails = contactDetails;
        this.locationDetail = locationDetail;
        this.status = status != null ? status : TicketStatus.OPEN;
        this.priority = priority;
        this.technicianId = technicianId;
        this.technicianFullName = technicianFullName;
        this.technicianCampusId = technicianCampusId;
        this.assignmentMethod = assignmentMethod;
        this.resolutionNotes = resolutionNotes;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
        this.assignedAt = assignedAt;
        this.resolvedAt = resolvedAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserCampusId() { return userCampusId; }
    public void setUserCampusId(String userCampusId) { this.userCampusId = userCampusId; }

    public String getDisplayId() { return displayId; }
    public void setDisplayId(String displayId) { this.displayId = displayId; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public IssueType getIssueType() { return issueType; }
    public void setIssueType(IssueType issueType) { this.issueType = issueType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }

    public String getLocationDetail() { return locationDetail; }
    public void setLocationDetail(String locationDetail) { this.locationDetail = locationDetail; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public String getTechnicianId() { return technicianId; }
    public void setTechnicianId(String technicianId) { this.technicianId = technicianId; }

    public String getTechnicianFullName() { return technicianFullName; }
    public void setTechnicianFullName(String technicianFullName) { this.technicianFullName = technicianFullName; }

    public String getTechnicianCampusId() { return technicianCampusId; }
    public void setTechnicianCampusId(String technicianCampusId) { this.technicianCampusId = technicianCampusId; }

    public String getAssignmentMethod() { return assignmentMethod; }
    public void setAssignmentMethod(String assignmentMethod) { this.assignmentMethod = assignmentMethod; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    /** Helper to check if ticker is finalized */
    public boolean isResolved() {
        return this.status == TicketStatus.RESOLVED;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Ticket ticket = (Ticket) o;
        return Objects.equals(id, ticket.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    public static TicketBuilder builder() {
        return new TicketBuilder();
    }

    public static class TicketBuilder {
        private String id;
        private String userId;
        private String userFullName;
        private String userCampusId;
        private String displayId;
        private String resourceId;
        private String title;
        private IssueType issueType;
        private String description;
        private String contactDetails;
        private String locationDetail;
        private TicketStatus status = TicketStatus.OPEN;
        private Priority priority;
        private String technicianId;
        private String technicianFullName;
        private String technicianCampusId;
        private String assignmentMethod;
        private String resolutionNotes;
        private String rejectionReason;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;
        private LocalDateTime assignedAt;
        private LocalDateTime resolvedAt;

        TicketBuilder() {}

        public TicketBuilder id(String id) { this.id = id; return this; }
        public TicketBuilder userId(String userId) { this.userId = userId; return this; }
        public TicketBuilder userFullName(String userFullName) { this.userFullName = userFullName; return this; }
        public TicketBuilder userCampusId(String userCampusId) { this.userCampusId = userCampusId; return this; }
        public TicketBuilder displayId(String displayId) { this.displayId = displayId; return this; }
        public TicketBuilder resourceId(String resourceId) { this.resourceId = resourceId; return this; }
        public TicketBuilder title(String title) { this.title = title; return this; }
        public TicketBuilder issueType(IssueType issueType) { this.issueType = issueType; return this; }
        public TicketBuilder description(String description) { this.description = description; return this; }
        public TicketBuilder contactDetails(String contactDetails) { this.contactDetails = contactDetails; return this; }
        public TicketBuilder locationDetail(String locationDetail) { this.locationDetail = locationDetail; return this; }
        public TicketBuilder status(TicketStatus status) { this.status = status; return this; }
        public TicketBuilder priority(Priority priority) { this.priority = priority; return this; }
        public TicketBuilder technicianId(String technicianId) { this.technicianId = technicianId; return this; }
        public TicketBuilder technicianFullName(String technicianFullName) { this.technicianFullName = technicianFullName; return this; }
        public TicketBuilder technicianCampusId(String technicianCampusId) { this.technicianCampusId = technicianCampusId; return this; }
        public TicketBuilder assignmentMethod(String assignmentMethod) { this.assignmentMethod = assignmentMethod; return this; }
        public TicketBuilder resolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; return this; }
        public TicketBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public TicketBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public TicketBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public TicketBuilder assignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; return this; }
        public TicketBuilder resolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; return this; }

        public Ticket build() {
            return new Ticket(id, userId, userFullName, userCampusId, displayId, resourceId, title, issueType, description, contactDetails, locationDetail, status, priority, technicianId, technicianFullName, technicianCampusId, assignmentMethod, resolutionNotes, rejectionReason, createdAt, updatedAt, assignedAt, resolvedAt);
        }
    }
}
