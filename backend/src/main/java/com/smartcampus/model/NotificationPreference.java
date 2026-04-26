package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Persists user-specific notification preferences.
 * Each user can toggle categories (except SECURITY).
 */
@Document(collection = "notification_preferences")
public class NotificationPreference {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    /**
     * Category Settings.
     * Use Enum as key for type safety.
     * Default state is typically handled by the service fallback logic.
     */
    private Map<NotificationCategory, Boolean> settings = new HashMap<>();

    private LocalDateTime lastUpdated;

    public NotificationPreference() {
    }

    public NotificationPreference(String id, String userId, Map<NotificationCategory, Boolean> settings, LocalDateTime lastUpdated) {
        this.id = id;
        this.userId = userId;
        this.settings = settings != null ? settings : new HashMap<>();
        this.lastUpdated = lastUpdated;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Map<NotificationCategory, Boolean> getSettings() { return settings; }
    public void setSettings(Map<NotificationCategory, Boolean> settings) { this.settings = settings; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    /**
     * Helper to initialize with all categories enabled.
     */
    public static NotificationPreference createDefault(String userId) {
        Map<NotificationCategory, Boolean> defaults = new HashMap<>();
        for (NotificationCategory cat : NotificationCategory.values()) {
            defaults.put(cat, true);
        }
        return NotificationPreference.builder()
                .userId(userId)
                .settings(defaults)
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    public static NotificationPreferenceBuilder builder() {
        return new NotificationPreferenceBuilder();
    }

    public static class NotificationPreferenceBuilder {
        private String id;
        private String userId;
        private Map<NotificationCategory, Boolean> settings = new HashMap<>();
        private LocalDateTime lastUpdated;

        NotificationPreferenceBuilder() {}

        public NotificationPreferenceBuilder id(String id) { this.id = id; return this; }
        public NotificationPreferenceBuilder userId(String userId) { this.userId = userId; return this; }
        public NotificationPreferenceBuilder settings(Map<NotificationCategory, Boolean> settings) { this.settings = settings; return this; }
        public NotificationPreferenceBuilder lastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; return this; }

        public NotificationPreference build() {
            return new NotificationPreference(id, userId, settings, lastUpdated);
        }
    }
}
