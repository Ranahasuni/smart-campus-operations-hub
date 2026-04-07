package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * AuditLog model for tracking significant user and system actions
 * for the security and monitoring module.
 */
@Document(collection = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String action; // e.g. LOGIN, LOGOUT, BOOKING_CREATE, PROFILE_UPDATE, ACCOUNT_LOCKED

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    private String details; // Optional description or metadata
}
