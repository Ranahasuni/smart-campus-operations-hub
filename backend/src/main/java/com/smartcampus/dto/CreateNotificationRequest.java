package com.smartcampus.dto;

import com.smartcampus.model.NotificationPriority;
import com.smartcampus.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request body for POST /notifications */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
