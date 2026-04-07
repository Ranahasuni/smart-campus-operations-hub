package com.smartcampus.service;

import com.smartcampus.model.AuditLog;
import com.smartcampus.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service to handle creation and retrieval of system audit logs.
 * Tracks user activity and security-related events.
 */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String userId, String action, String details) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }

    public List<AuditLog> getLogsByUser(String userId) {
        return auditLogRepository.findByUserId(userId);
    }
}
