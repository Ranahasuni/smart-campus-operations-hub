package com.smartcampus.service;

import com.smartcampus.model.AuditLog;
import com.smartcampus.model.User;
import com.smartcampus.repository.AuditLogRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to handle creation and retrieval of system audit logs.
 * Tracks user activity and security-related events.
 * Enriches each log with the user's campusId (principalId) and role (principalRole)
 * so that audit records are human-readable without a secondary lookup.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /**
     * Lightweight identity cache to avoid DB round-trips on every audit write.
     * Key = userId (MongoDB ObjectId), Value = [campusId, role].
     */
    private final Map<String, String[]> principalCache = new ConcurrentHashMap<>();
    
    @jakarta.annotation.PostConstruct
    public void init() {
        log(null, "SYSTEM_STARTUP", "Audit Service initialized and ready to track events.");
    }

    @org.springframework.scheduling.annotation.Async
    public void log(String userId, String action, String details) {
        try {
            String principalId = null;
            String principalRole = null;

            if (userId != null) {
                String[] cached = principalCache.get(userId);
                if (cached != null) {
                    principalId = cached[0];
                    principalRole = cached[1];
                } else {
                    // Resolve from DB and cache
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        principalId = user.getCampusId();
                        principalRole = user.getRole() != null ? user.getRole().name() : "UNKNOWN";
                        principalCache.put(userId, new String[]{principalId, principalRole});
                    }
                }
            }

            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .principalId(principalId)
                    .principalRole(principalRole)
                    .action(action)
                    .details(details)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
            // Non-blocking log
        } catch (Exception e) {
            // Silently fail or log to app log but don't crash main service
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

