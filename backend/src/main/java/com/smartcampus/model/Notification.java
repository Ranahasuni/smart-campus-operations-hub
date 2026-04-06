package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    @Builder.Default
    private NotificationType type = NotificationType.SYSTEM;

    /** Priority level */
    @Builder.Default
    private NotificationPriority priority = NotificationPriority.MEDIUM;

    /** Has the user seen this notification? */
    @Builder.Default
    private boolean isRead = false;

    /** When was the notification created */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Optional reference ID (e.g., booking ID as string) */
    private String referenceId;
}
