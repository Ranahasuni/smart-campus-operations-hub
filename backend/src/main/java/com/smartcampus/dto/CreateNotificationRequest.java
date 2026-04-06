package com.smartcampus.dto;

import com.smartcampus.model.NotificationPriority;
import com.smartcampus.model.NotificationType;
import lombok.Data;

/** Request body for POST /notifications */
@Data
public class CreateNotificationRequest {

    /** Target user ID (MongoDB String ObjectID) */
    private String userId;

    private String title;
    private String message;
    private NotificationType type;
    private NotificationPriority priority;

    /** Optional: ID of the booking / ticket (as string) */
    private String referenceId;
}
