package com.smartcampus.dto;

import com.smartcampus.model.NotificationPriority;
import com.smartcampus.model.NotificationType;

import java.time.LocalDateTime;

/** Safe notification view returned to the frontend */
public class NotificationResponse {
    private String               id; // MongoDB ObjectID as string
    private String               title;
    private String               message;
    private NotificationType     type;
    private NotificationPriority priority;
    private boolean              isRead;
    private LocalDateTime        createdAt;
    private String               referenceId; // Booking / Ticket ID as string
    private String               recipientId; // Recipient User ID as string

    public NotificationResponse() {
    }

    public NotificationResponse(String id, String title, String message, NotificationType type, NotificationPriority priority, boolean isRead, LocalDateTime createdAt, String referenceId, String recipientId) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.priority = priority;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.referenceId = referenceId;
        this.recipientId = recipientId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public static NotificationResponseBuilder builder() {
        return new NotificationResponseBuilder();
    }

    public static class NotificationResponseBuilder {
        private String               id;
        private String               title;
        private String               message;
        private NotificationType     type;
        private NotificationPriority priority;
        private boolean              isRead;
        private LocalDateTime        createdAt;
        private String               referenceId;
        private String               recipientId;

        NotificationResponseBuilder() {}

        public NotificationResponseBuilder id(String id) { this.id = id; return this; }
        public NotificationResponseBuilder title(String title) { this.title = title; return this; }
        public NotificationResponseBuilder message(String message) { this.message = message; return this; }
        public NotificationResponseBuilder type(NotificationType type) { this.type = type; return this; }
        public NotificationResponseBuilder priority(NotificationPriority priority) { this.priority = priority; return this; }
        public NotificationResponseBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public NotificationResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public NotificationResponseBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }
        public NotificationResponseBuilder recipientId(String recipientId) { this.recipientId = recipientId; return this; }

        public NotificationResponse build() {
            return new NotificationResponse(id, title, message, type, priority, isRead, createdAt, referenceId, recipientId);
        }
    }
}
