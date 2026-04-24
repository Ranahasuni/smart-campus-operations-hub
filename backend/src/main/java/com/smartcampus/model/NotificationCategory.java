package com.smartcampus.model;

import lombok.Getter;

/**
 * High-level categories for grouping notifications.
 * Allows users to enable/disable specific streams of alerts.
 */
@Getter
public enum NotificationCategory {
    SYSTEM("System Notifications", "General platform updates and service announcements.", true),
    BOOKINGS("Booking Updates", "Alerts regarding your resource reservations and check-ins.", true),
    MAINTENANCE("Maintenance & Support", "Status updates on your reported issues and tickets.", true),
    SECURITY("Identity & Security", "Critical alerts regarding login, security, and account safety.", false);

    private final String label;
    private final String description;
    private final boolean userCanDisable;

    NotificationCategory(String label, String description, boolean userCanDisable) {
        this.label = label;
        this.description = description;
        this.userCanDisable = userCanDisable;
    }
}
