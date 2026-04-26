package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * AuditLog model for tracking significant user and system actions
 * for the security and monitoring module.
 */
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String userId;

    /** Human-readable identity — the campusId (e.g. lec01, stu05, admin01) */
    private String principalId;

    /** Role at the time of the event (ADMIN, LECTURER, STUDENT, STAFF) */
    private String principalRole;

    private String action; // e.g. LOGIN, LOGOUT, BOOKING_CREATE, PROFILE_UPDATE, ACCOUNT_LOCKED

    private LocalDateTime timestamp = LocalDateTime.now();

    private String details; // Optional description or metadata

    public AuditLog() {
    }

    public AuditLog(String id, String userId, String principalId, String principalRole, String action, LocalDateTime timestamp, String details) {
        this.id = id;
        this.userId = userId;
        this.principalId = principalId;
        this.principalRole = principalRole;
        this.action = action;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
        this.details = details;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPrincipalId() { return principalId; }
    public void setPrincipalId(String principalId) { this.principalId = principalId; }

    public String getPrincipalRole() { return principalRole; }
    public void setPrincipalRole(String principalRole) { this.principalRole = principalRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public static AuditLogBuilder builder() {
        return new AuditLogBuilder();
    }

    public static class AuditLogBuilder {
        private String id;
        private String userId;
        private String principalId;
        private String principalRole;
        private String action;
        private LocalDateTime timestamp = LocalDateTime.now();
        private String details;

        AuditLogBuilder() {}

        public AuditLogBuilder id(String id) { this.id = id; return this; }
        public AuditLogBuilder userId(String userId) { this.userId = userId; return this; }
        public AuditLogBuilder principalId(String principalId) { this.principalId = principalId; return this; }
        public AuditLogBuilder principalRole(String principalRole) { this.principalRole = principalRole; return this; }
        public AuditLogBuilder action(String action) { this.action = action; return this; }
        public AuditLogBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public AuditLogBuilder details(String details) { this.details = details; return this; }

        public AuditLog build() {
            return new AuditLog(id, userId, principalId, principalRole, action, timestamp, details);
        }
    }
}
