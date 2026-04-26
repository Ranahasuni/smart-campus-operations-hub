package com.smartcampus.controller;

import com.smartcampus.model.NotificationCategory;
import com.smartcampus.model.NotificationPreference;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notification-preferences")
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;
    private final UserRepository userRepository;

    public NotificationPreferenceController(NotificationPreferenceService preferenceService, UserRepository userRepository) {
        this.preferenceService = preferenceService;
        this.userRepository = userRepository;
    }

    /**
     * Get notification preferences for the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<NotificationPreference> getMyPreferences(Authentication authentication) {
        String userId = resolveUserId(authentication);
        return ResponseEntity.ok(preferenceService.getPreferences(userId));
    }

    /**
     * Update notification preferences for the currently authenticated user.
     */
    @PutMapping("/me")
    public ResponseEntity<NotificationPreference> updateMyPreferences(
            Authentication authentication,
            @RequestBody Map<NotificationCategory, Boolean> settings) {
        
        String userId = resolveUserId(authentication);
        return ResponseEntity.ok(preferenceService.updatePreferences(userId, settings));
    }

    /**
     * Helper to resolve the MongoDB userId from the Security Principal (campusId).
     */
    private String resolveUserId(Authentication authentication) {
        String campusId = authentication.getName();
        User user = userRepository.findByCampusId(campusId)
                .orElseThrow(() -> new UsernameNotFoundException("Security Principal mismatch: User not found in DB"));
        return user.getId();
    }
}
