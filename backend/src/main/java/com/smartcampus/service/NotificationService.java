package com.smartcampus.service;

import com.smartcampus.dto.CreateNotificationRequest;
import com.smartcampus.dto.NotificationResponse;
import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationPriority;
import com.smartcampus.model.NotificationType;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Core notification logic (MongoDB implementation).
 *
 * Other services (BookingService, TicketService) call
 * notificationService.send(...) to trigger notifications.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;
    private final MongoTemplate          mongoTemplate;
    private final NotificationPreferenceService preferenceService;

    // ── Public API used by other services ────────────────────────────────────

    /**
     * Create and persist a notification.
     * Includes a 5-second idempotency check and preference gatekeeper.
     */
    public NotificationResponse send(CreateNotificationRequest req) {
        // userId should be a string ObjectID
        User recipient = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));

        // 1. GATEKEEPER CHECK: Does the user want this notification?
        if (!preferenceService.isNotificationAllowed(recipient.getId(), req.getType())) {
            // Drop notification silently if preference is OFF
            return null; 
        }

        // Prevent exact duplicates within a short time window (5 seconds)
        java.time.LocalDateTime fiveSecondsAgo = java.time.LocalDateTime.now().minusSeconds(5);
        List<Notification> existing = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipient.getId());
        
        boolean isDuplicate = existing.stream().anyMatch(n -> 
            n.getCreatedAt().isAfter(fiveSecondsAgo) &&
            n.getTitle().equals(req.getTitle()) &&
            n.getMessage().equals(req.getMessage()) &&
            ((n.getReferenceId() == null && req.getReferenceId() == null) || 
             (n.getReferenceId() != null && n.getReferenceId().equals(req.getReferenceId())))
        );

        if (isDuplicate) {
            return toResponse(existing.get(0));
        }

        NotificationPriority priority = req.getPriority() != null
                ? req.getPriority()
                : derivePriority(req.getType());

        Notification notification = Notification.builder()
                .recipientId(recipient.getId())
                .title(req.getTitle())
                .message(req.getMessage())
                .type(req.getType())
                .priority(priority)
                .referenceId(req.getReferenceId())
                .build();

        return toResponse(notificationRepository.save(notification));
    }

    // ── Convenience factory methods for other services ────────────────────────

    public void notifyBookingApproved(String userId, String bookingId, String resourceName) {
        CreateNotificationRequest req = new CreateNotificationRequest();
        req.setUserId(userId);
        req.setTitle("Booking Approved ✅");
        req.setMessage("Your booking for " + resourceName + " has been approved.");
        req.setType(NotificationType.BOOKING_APPROVED);
        req.setPriority(NotificationPriority.MEDIUM);
        req.setReferenceId(bookingId);
        send(req);
    }

    public void notifyCheckIn(String userId, String bookingId, String bookingCode) {
        CreateNotificationRequest req = new CreateNotificationRequest();
        req.setUserId(userId);
        req.setTitle("Check-in Successful ✅");
        req.setMessage("You have successfully checked in for your booking: " + bookingCode);
        req.setType(NotificationType.CHECK_IN);
        req.setPriority(NotificationPriority.MEDIUM);
        req.setReferenceId(bookingId);
        send(req);
    }

    public void notifyBookingRejected(String userId, String bookingId, String resourceName, String reason) {
        CreateNotificationRequest req = new CreateNotificationRequest();
        req.setUserId(userId);
        req.setTitle("Booking Rejected ❌");
        req.setMessage("Your booking for " + resourceName + " was rejected. Reason: " + reason);
        req.setType(NotificationType.BOOKING_REJECTED);
        req.setPriority(NotificationPriority.HIGH);
        req.setReferenceId(bookingId);
        send(req);
    }

    public void notifyTicketUpdated(String userId, String ticketId, String status) {
        CreateNotificationRequest req = new CreateNotificationRequest();
        req.setUserId(userId);
        req.setTitle("Ticket Updated 🔧");
        req.setMessage("Your ticket " + ticketId + " status changed to: " + status);
        req.setType(NotificationType.TICKET_UPDATED);
        req.setPriority(NotificationPriority.MEDIUM);
        req.setReferenceId(ticketId);
        send(req);
    }

    /** Broadcast alert to all Administrators (Honors preferences) */
    public void notifyAdmins(String title, String message, NotificationType type, NotificationPriority priority) {
        List<User> admins = userRepository.findByRole(com.smartcampus.model.Role.ADMIN);
        for (User admin : admins) {
            // Check preference for each admin
            if (preferenceService.isNotificationAllowed(admin.getId(), type)) {
                Notification n = Notification.builder()
                        .recipientId(admin.getId())
                        .title(title)
                        .message(message)
                        .type(type)
                        .priority(priority)
                        .build();
                notificationRepository.save(n);
            }
        }
    }

    // ── Read operations ───────────────────────────────────────────────────────

    public List<NotificationResponse> getAllForUser(String userId) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadForUser(String userId) {
        return notificationRepository
                .findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    public List<NotificationResponse> getByType(String userId, NotificationType type) {
        return notificationRepository
                .findByRecipientIdAndTypeOrderByCreatedAtDesc(userId, type)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Write operations ──────────────────────────────────────────────────────

    public void markAsRead(String notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }

    /** Efficient bulk update using MongoTemplate */
    public void markAllAsRead(String userId) {
        Query query = new Query(Criteria.where("recipientId").is(userId).and("isRead").is(false));
        Update update = new Update().set("isRead", true);
        mongoTemplate.updateMulti(query, update, Notification.class);
    }

    /** Permanently remove a notification */
    public void delete(String id) {
        notificationRepository.deleteById(id);
    }

    /** Efficient bulk delete using MongoTemplate for all READ notifications of a user */
    public void clearReadForUser(String userId) {
        Query query = new Query(Criteria.where("recipientId").is(userId).and("isRead").is(true));
        mongoTemplate.remove(query, Notification.class);
    }

    /** Toggle the read status back and forth */
    public void toggleReadStatus(String id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        n.setRead(!n.isRead());
        notificationRepository.save(n);
    }


    // ── Helpers ───────────────────────────────────────────────────────────────

    private NotificationPriority derivePriority(NotificationType type) {
        if (type == null) return NotificationPriority.MEDIUM;
        return switch (type) {
            case BOOKING_REJECTED -> NotificationPriority.HIGH;
            case BOOKING_APPROVED -> NotificationPriority.MEDIUM;
            case BOOKING_REMINDER -> NotificationPriority.LOW;
            case TICKET_UPDATED   -> NotificationPriority.MEDIUM;
            default               -> NotificationPriority.LOW;
        };
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getPriority(),
                n.isRead(),
                n.getCreatedAt(),
                n.getReferenceId(),
                n.getRecipientId()
        );
    }
}
