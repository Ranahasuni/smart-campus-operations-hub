package com.smartcampus.service;

import com.smartcampus.model.Notification;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationCleanupService {

    private final MongoTemplate mongoTemplate;

    /**
     * Runs every day at 3:00 AM to prune deep history.
     * Deletes READ notifications older than 7 days.
     * Deletes UNREAD notifications older than 30 days.
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void pruneOldNotifications() {
        log.info("Starting automated notification pruning...");
        
        // 1. Delete READ notifications older than 7 days
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        Query readQuery = new Query(Criteria.where("isRead").is(true)
                                            .and("createdAt").lt(sevenDaysAgo));
        long readDeleted = mongoTemplate.remove(readQuery, Notification.class).getDeletedCount();

        // 2. Delete UNREAD notifications older than 30 days
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Query unreadQuery = new Query(Criteria.where("isRead").is(false)
                                              .and("createdAt").lt(thirtyDaysAgo));
        long unreadDeleted = mongoTemplate.remove(unreadQuery, Notification.class).getDeletedCount();

        log.info("Pruned {} read notifications (older than 7 days) and {} unread notifications (older than 30 days).", readDeleted, unreadDeleted);
    }
}
