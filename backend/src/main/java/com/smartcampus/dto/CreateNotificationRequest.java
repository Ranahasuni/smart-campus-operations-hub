package com.smartcampus.dto;

import com.smartcampus.model.NotificationPriority;
import com.smartcampus.model.NotificationType;

/** Request body for POST /notifications */
public class CreateNotificationRequest {

    /** Target user ID (MongoDB String ObjectID) */
    private String userId;

    private String title;
    private String message;
    private NotificationType type;
    private NotificationPriority priority;

    /** Optional: ID of the booking / ticket (as string) */
    private String referenceId;

    public CreateNotificationRequest() {
    }

    public CreateNotificationRequest(String userId, String title, String message, NotificationType type, NotificationPriority priority, String referenceId) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.priority = priority;
        this.referenceId = referenceId;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public NotificationPriority getPriority() { return priority; }
    public void setPriority(NotificationPriority priority) { this.priority = priority; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public static CreateNotificationRequestBuilder builder() {
        return new CreateNotificationRequestBuilder();
    }

    public static class CreateNotificationRequestBuilder {
        private String userId;
        private String title;
        private String message;
        private NotificationType type;
        private NotificationPriority priority;
        private String referenceId;

        CreateNotificationRequestBuilder() {}

        public CreateNotificationRequestBuilder userId(String userId) { this.userId = userId; return this; }
        public CreateNotificationRequestBuilder title(String title) { this.title = title; return this; }
        public CreateNotificationRequestBuilder message(String message) { this.message = message; return this; }
        public CreateNotificationRequestBuilder type(NotificationType type) { this.type = type; return this; }
        public CreateNotificationRequestBuilder priority(NotificationPriority priority) { this.priority = priority; return this; }
        public CreateNotificationRequestBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }

        public CreateNotificationRequest build() {
            return new CreateNotificationRequest(userId, title, message, type, priority, referenceId);
        }
    }
}
