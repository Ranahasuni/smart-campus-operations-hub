package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents a notification sent to a specific user.
 * Types: BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_REMINDER, TICKET_UPDATED, SYSTEM
 * Priority: HIGH, MEDIUM, LOW
 */
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    /** The user ID this notification belongs to */
    @Indexed
    private String recipientId;

    /** Short title, e.g. "Booking Approved" */
    private String title;

    /** Full message body */
    private String message;

    /** Notification category */
    private NotificationType type = NotificationType.SYSTEM;

    /** Priority level */
    private NotificationPriority priority = NotificationPriority.MEDIUM;

    /** Has the user seen this notification? */
    private boolean isRead = false;

    /** When was the notification created */
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Optional reference ID (e.g., booking ID as string) */
    private String referenceId;

    public Notification() {
    }

    public Notification(String id, String recipientId, String title, String message, NotificationType type, NotificationPriority priority, boolean isRead, LocalDateTime createdAt, String referenceId) {
        this.id = id;
        this.recipientId = recipientId;
        this.title = title;
        this.message = message;
        this.type = type != null ? type : NotificationType.SYSTEM;
        this.priority = priority != null ? priority : NotificationPriority.MEDIUM;
        this.isRead = isRead;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.referenceId = referenceId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public NotificationPriority getPriority() { return priority; }
    public void setPriority(NotificationPriority priority) { this.priority = priority; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public static NotificationBuilder builder() {
        return new NotificationBuilder();
    }

    public static class NotificationBuilder {
        private String id;
        private String recipientId;
        private String title;
        private String message;
        private NotificationType type = NotificationType.SYSTEM;
        private NotificationPriority priority = NotificationPriority.MEDIUM;
        private boolean isRead = false;
        private LocalDateTime createdAt = LocalDateTime.now();
        private String referenceId;

        NotificationBuilder() {}

        public NotificationBuilder id(String id) { this.id = id; return this; }
        public NotificationBuilder recipientId(String recipientId) { this.recipientId = recipientId; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder type(NotificationType type) { this.type = type; return this; }
        public NotificationBuilder priority(NotificationPriority priority) { this.priority = priority; return this; }
        public NotificationBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public NotificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public NotificationBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }

        public Notification build() {
            return new Notification(id, recipientId, title, message, type, priority, isRead, createdAt, referenceId);
        }
    }
}
