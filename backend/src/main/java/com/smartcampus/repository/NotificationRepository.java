package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    /** All notifications for a user, newest first */
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);

    /** Only unread notifications for a user */
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(String recipientId);

    /** Count of unread notifications (for the bell badge) */
    long countByRecipientIdAndIsReadFalse(String recipientId);

    /** Notifications filtered by type */
    List<Notification> findByRecipientIdAndTypeOrderByCreatedAtDesc(String recipientId, NotificationType type);

    // Bulk updates like markAllAsRead will be handled in the service via MongoTemplate
}
