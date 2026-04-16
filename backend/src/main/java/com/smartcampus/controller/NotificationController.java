package com.smartcampus.controller;

import com.smartcampus.dto.CreateNotificationRequest;
import com.smartcampus.dto.NotificationResponse;
import com.smartcampus.model.NotificationType;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API for notifications. (MongoDB)
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** Get all notifications for a user */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(@RequestParam String userId) {
        return ResponseEntity.ok(notificationService.getAllForUser(userId));
    }

    /** Get only unread notifications */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(@RequestParam String userId) {
        return ResponseEntity.ok(notificationService.getUnreadForUser(userId));
    }

    /** Get unread count — used by the notification bell badge */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam String userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unread", count));
    }

    /** Filter notifications by type */
    @GetMapping("/filter")
    public ResponseEntity<List<NotificationResponse>> getByType(
            @RequestParam String userId,
            @RequestParam NotificationType type) {
        return ResponseEntity.ok(notificationService.getByType(userId, type));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationResponse> create(@RequestBody CreateNotificationRequest req) {
        return ResponseEntity.ok(notificationService.send(req));
    }

    /** Mark a single notification as read */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    /** Mark all notifications as read for a user */
    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    /** Delete a notification */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

