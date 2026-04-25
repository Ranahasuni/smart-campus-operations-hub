package com.smartcampus.service;

import com.smartcampus.model.NotificationCategory;
import com.smartcampus.model.NotificationPreference;
import com.smartcampus.model.NotificationType;
import com.smartcampus.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    /**
     * The Central Gatekeeper for all notifications.
     * Logic:
     * 1. If category is SECURITY -> return true (Mandatory).
     * 2. Find preferences for user.
     * 3. If missing -> Initialize defaults, save, and return true.
     * 4. If category key is missing from map -> return true (Partial migration).
     * 5. Return DB value.
     */
    public boolean isNotificationAllowed(String userId, NotificationType type) {
        NotificationCategory category = type.getCategory();

        // 1. SECURITY is always allowed
        if (category == NotificationCategory.SECURITY) {
            return true;
        }

        // 2 & 3. Find preferences or Initialize
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    log.info("Initializing default notification preferences for user: {}", userId);
                    return preferenceRepository.save(NotificationPreference.createDefault(userId));
                });

        // 4. Check specific category (Handle partial migration)
        if (!pref.getSettings().containsKey(category)) {
            log.warn("Category {} missing for user {}. Defaulting to true.", category, userId);
            return true;
        }

        // 5. Return actual setting
        return pref.getSettings().get(category);
    }

    public NotificationPreference getPreferences(String userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> preferenceRepository.save(NotificationPreference.createDefault(userId)));
    }

    public NotificationPreference updatePreferences(String userId, Map<NotificationCategory, Boolean> newSettings) {
        NotificationPreference pref = getPreferences(userId);
        
        // Enforce SECURITY is always true even if frontend tries to send false
        newSettings.put(NotificationCategory.SECURITY, true);
        
        pref.setSettings(newSettings);
        pref.setLastUpdated(LocalDateTime.now());
        
        return preferenceRepository.save(pref);
    }
}
