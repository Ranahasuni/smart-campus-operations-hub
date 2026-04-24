package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    @Builder.Default
    private Map<NotificationCategory, Boolean> settings = new HashMap<>();

    private LocalDateTime lastUpdated;

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
}
