package com.smartcampus.config;

import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Automatically creates MongoDB indexes on application startup.
 * This dramatically improves query performance for frequently queried fields.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MongoIndexConfig {

    private final MongoTemplate mongoTemplate;

    @EventListener(ContextRefreshedEvent.class)
    public void initializeIndexes() {
        log.info("Creating MongoDB indexes for optimal query performance...");
        
        // ── Ticket Collection Indexes ──────────────────────────────────
        mongoTemplate.indexOps("Ticket")
            .ensureIndex(new Index().on("userId", Sort.Direction.DESC).named("idx_userId_desc"));
        log.debug("✓ Index created: Ticket.userId");
        
        mongoTemplate.indexOps("Ticket")
            .ensureIndex(new Index().on("status", Sort.Direction.ASC).named("idx_status_asc"));
        log.debug("✓ Index created: Ticket.status");
        
        mongoTemplate.indexOps("Ticket")
            .ensureIndex(new Index().on("resourceId", Sort.Direction.ASC).named("idx_resourceId_asc"));
        log.debug("✓ Index created: Ticket.resourceId");
        
        mongoTemplate.indexOps("Ticket")
            .ensureIndex(new Index().on("priority", Sort.Direction.ASC).named("idx_priority_asc"));
        log.debug("✓ Index created: Ticket.priority");
        
        mongoTemplate.indexOps("Ticket")
            .ensureIndex(new Index().on("technicianId", Sort.Direction.ASC).named("idx_technicianId_asc"));
        log.debug("✓ Index created: Ticket.technicianId");
        
        mongoTemplate.indexOps("Ticket")
            .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC).named("idx_createdAt_desc"));
        log.debug("✓ Index created: Ticket.createdAt");
        
        // ── Resource Collection Indexes ────────────────────────────────
        mongoTemplate.indexOps("Resource")
            .ensureIndex(new Index().on("building", Sort.Direction.ASC).named("idx_building_asc"));
        log.debug("✓ Index created: Resource.building");
        
        mongoTemplate.indexOps("Resource")
            .ensureIndex(new Index().on("floor", Sort.Direction.ASC).named("idx_floor_asc"));
        log.debug("✓ Index created: Resource.floor");
        
        mongoTemplate.indexOps("Resource")
            .ensureIndex(new Index().on("type", Sort.Direction.ASC).named("idx_type_asc"));
        log.debug("✓ Index created: Resource.type");
        
        mongoTemplate.indexOps("Resource")
            .ensureIndex(new Index().on("status", Sort.Direction.ASC).named("idx_status_asc"));
        log.debug("✓ Index created: Resource.status");
        
        mongoTemplate.indexOps("Resource")
            .ensureIndex(new Index().on("name", Sort.Direction.ASC).named("idx_name_asc"));
        log.debug("✓ Index created: Resource.name");
        
        mongoTemplate.indexOps("Resource")
            .ensureIndex(new Index().on("building", Sort.Direction.ASC).on("floor", Sort.Direction.ASC).named("idx_building_floor"));
        log.debug("✓ Index created: Resource.building + floor (composite)");
        
        // ── Booking Collection Indexes ─────────────────────────────────
        mongoTemplate.indexOps("Booking")
            .ensureIndex(new Index().on("userId", Sort.Direction.ASC).named("idx_userId_asc"));
        log.debug("✓ Index created: Booking.userId");
        
        mongoTemplate.indexOps("Booking")
            .ensureIndex(new Index().on("date", Sort.Direction.ASC).named("idx_date_asc"));
        log.debug("✓ Index created: Booking.date");
        
        mongoTemplate.indexOps("Booking")
            .ensureIndex(new Index().on("status", Sort.Direction.ASC).named("idx_status_asc"));
        log.debug("✓ Index created: Booking.status");
        
        mongoTemplate.indexOps("Booking")
            .ensureIndex(new Index().on("resourceIds", Sort.Direction.ASC).named("idx_resourceIds_asc"));
        log.debug("✓ Index created: Booking.resourceIds");
        
        mongoTemplate.indexOps("Booking")
            .ensureIndex(new Index().on("userId", Sort.Direction.ASC).on("date", Sort.Direction.DESC).named("idx_userId_date"));
        log.debug("✓ Index created: Booking.userId + date (composite)");
        
        // ── User Collection Indexes ────────────────────────────────────
        mongoTemplate.indexOps("User")
            .ensureIndex(new Index().on("campusId", Sort.Direction.ASC).unique().named("idx_campusId_unique"));
        log.debug("✓ Index created: User.campusId (UNIQUE)");
        
        mongoTemplate.indexOps("User")
            .ensureIndex(new Index().on("role", Sort.Direction.ASC).named("idx_role_asc"));
        log.debug("✓ Index created: User.role");
        
        // ── Comment Collection Indexes ─────────────────────────────────
        mongoTemplate.indexOps("Comment")
            .ensureIndex(new Index().on("ticketId", Sort.Direction.ASC).named("idx_ticketId_asc"));
        log.debug("✓ Index created: Comment.ticketId");
        
        mongoTemplate.indexOps("Comment")
            .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC).named("idx_createdAt_desc"));
        log.debug("✓ Index created: Comment.createdAt");
        
        // ── Notification Collection Indexes ────────────────────────────
        mongoTemplate.indexOps("Notification")
            .ensureIndex(new Index().on("userId", Sort.Direction.ASC).named("idx_userId_asc"));
        log.debug("✓ Index created: Notification.userId");
        
        mongoTemplate.indexOps("Notification")
            .ensureIndex(new Index().on("isRead", Sort.Direction.ASC).named("idx_isRead_asc"));
        log.debug("✓ Index created: Notification.isRead");
        
        mongoTemplate.indexOps("Notification")
            .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC).named("idx_createdAt_desc"));
        log.debug("✓ Index created: Notification.createdAt");
        
        log.info("✅ All MongoDB indexes created successfully!");
    }
}
