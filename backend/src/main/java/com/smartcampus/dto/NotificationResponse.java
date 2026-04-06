package com.smartcampus.dto;

import com.smartcampus.model.NotificationPriority;
import com.smartcampus.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** Safe notification view returned to the frontend */
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
