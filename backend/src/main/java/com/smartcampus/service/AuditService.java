package com.smartcampus.service;

import com.smartcampus.model.AuditLog;
import com.smartcampus.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service to handle creation and retrieval of system audit logs.
 * Tracks user activity and security-related events.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    
    @jakarta.annotation.PostConstruct
    public void init() {
        log(null, "SYSTEM_STARTUP", "Audit Service initialized and ready to track events.");
    }

    public void log(String userId, String action, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .action(action)
                    .details(details)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
            log.info("AUDIT LOG: User={} Action={} Details={}", userId, action, details);
        } catch (Exception e) {
            log.error("Failed to save audit log for action={}: {}", action, e.getMessage(), e);
        }
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }

    public List<AuditLog> getLogsByUser(String userId) {
        return auditLogRepository.findByUserId(userId);
    }

    public List<AuditLog> getRecentLogs(int limit) {
        return auditLogRepository.findAll(
            org.springframework.data.domain.PageRequest.of(0, limit, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp"))
        ).getContent();
    }
}
