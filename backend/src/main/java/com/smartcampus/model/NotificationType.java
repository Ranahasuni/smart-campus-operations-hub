package com.smartcampus.model;

public enum NotificationType {
    BOOKING_APPROVED,
    BOOKING_REJECTED,
    BOOKING_REMINDER,
    CHECK_IN,
    TICKET_UPDATED,
    SYSTEM;

    /**
     * Map granular types to high-level categories for preference filtering.
     */
    public NotificationCategory getCategory() {
        return switch (this) {
            case BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_REMINDER, CHECK_IN -> NotificationCategory.BOOKINGS;
            case TICKET_UPDATED -> NotificationCategory.MAINTENANCE;
            case SYSTEM -> NotificationCategory.SYSTEM;
            // Any other future types default to SECURITY unless explicitly moved
            default -> NotificationCategory.SECURITY;
        };
    }
}
