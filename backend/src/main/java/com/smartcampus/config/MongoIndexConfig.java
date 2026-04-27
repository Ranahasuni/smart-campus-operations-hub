package com.smartcampus.config;

import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class MongoIndexConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoIndexConfig.class);

    private final MongoTemplate mongoTemplate;

    public MongoIndexConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void initializeIndexes() {
        // ⚡ ASYNC INITIALIZATION: Run indexing in background to prevent blocking startup (103s delay fix)
        new Thread(() -> {
            try {
                log.info("Starting background MongoDB index synchronization...");
                
                // ── Ticket Collection Indexes ──────────────────────────────────
                safeIndex("tickets", new Index().on("userId", Sort.Direction.DESC).named("idx_userId_desc"));
                safeIndex("tickets", new Index().on("status", Sort.Direction.ASC).named("idx_status_asc"));
                safeIndex("tickets", new Index().on("resourceId", Sort.Direction.ASC).named("idx_resourceId_asc"));
                safeIndex("tickets", new Index().on("priority", Sort.Direction.ASC).named("idx_priority_asc"));
                safeIndex("tickets", new Index().on("technicianId", Sort.Direction.ASC).named("idx_technicianId_asc"));
                safeIndex("tickets", new Index().on("createdAt", Sort.Direction.DESC).named("idx_createdAt_desc"));
                
                // ── Resource Collection Indexes ────────────────────────────────
                safeIndex("resources", new Index().on("building", Sort.Direction.ASC).named("idx_building_asc"));
                safeIndex("resources", new Index().on("floor", Sort.Direction.ASC).named("idx_floor_asc"));
                safeIndex("resources", new Index().on("type", Sort.Direction.ASC).named("idx_type_asc"));
                safeIndex("resources", new Index().on("status", Sort.Direction.ASC).named("idx_status_asc"));
                safeIndex("resources", new Index().on("name", Sort.Direction.ASC).named("idx_name_asc"));
                safeIndex("resources", new Index().on("building", Sort.Direction.ASC).on("floor", Sort.Direction.ASC).named("idx_building_floor"));
                
                // ── Booking Collection Indexes ─────────────────────────────────
                safeIndex("bookings", new Index().on("userId", Sort.Direction.ASC).named("idx_userId_asc"));
                safeIndex("bookings", new Index().on("date", Sort.Direction.ASC).named("idx_date_asc"));
                safeIndex("bookings", new Index().on("status", Sort.Direction.ASC).named("idx_status_asc"));
                safeIndex("bookings", new Index().on("resourceIds", Sort.Direction.ASC).named("idx_resourceIds_asc"));
                safeIndex("bookings", new Index().on("userId", Sort.Direction.ASC).on("date", Sort.Direction.DESC).named("idx_userId_date"));
                
                // ── User Collection Indexes ────────────────────────────────────
                safeIndex("users", new Index().on("campusId", Sort.Direction.ASC).unique().named("idx_campusId_unique"));
                safeIndex("users", new Index().on("role", Sort.Direction.ASC).named("idx_role_asc"));
                
                // ── Comment Collection Indexes ─────────────────────────────────
                safeIndex("comments", new Index().on("ticketId", Sort.Direction.ASC).named("idx_ticketId_asc"));
                safeIndex("comments", new Index().on("createdAt", Sort.Direction.DESC).named("idx_createdAt_desc"));
                
                // ── Notification Collection Indexes ────────────────────────────
                safeIndex("notifications", new Index().on("userId", Sort.Direction.ASC).named("idx_userId_asc"));
                safeIndex("notifications", new Index().on("isRead", Sort.Direction.ASC).named("idx_isRead_asc"));
                safeIndex("notifications", new Index().on("createdAt", Sort.Direction.DESC).named("idx_createdAt_desc"));
                
                log.info("✅ MongoDB index synchronization complete (Background)!");
            } catch (Exception e) {
                log.warn("Non-critical error during background indexing: {}", e.getMessage());
            }
        }).start();
    }

    private void safeIndex(String collection, Index index) {
        try {
            mongoTemplate.indexOps(collection).ensureIndex(index);
        } catch (Exception e) {
            log.debug("Skipping existing or conflicting index on {}: {}", collection, e.getMessage());
        }
    }
}
