package com.smartcampus.controller;

import com.smartcampus.model.AuditLog;
import com.smartcampus.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for viewing Audit Logs — ADMIN only.
 */
@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final AuditService auditService;

    public LogController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<List<AuditLog>> getAllLogs(@RequestParam(required = false) Integer limit) {
        try {
            List<AuditLog> logs;
            if (limit != null) {
                System.out.println("DEBUG: LogController.getAllLogs() called with limit=" + limit);
                logs = auditService.getRecentLogs(limit);
            } else {
                System.out.println("DEBUG: LogController.getAllLogs() called without limit");
                logs = auditService.getAllLogs();
            }
            System.out.println("DEBUG: Returning " + logs.size() + " audit logs");
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            System.err.println("ERROR in LogController.getAllLogs(): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getLogsByUser(@PathVariable String id) {
        try {
            System.out.println("DEBUG: LogController.getLogsByUser() called with id=" + id);
            List<AuditLog> logs = auditService.getLogsByUser(id);
            System.out.println("DEBUG: Returning " + logs.size() + " logs for user " + id);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            System.err.println("ERROR in LogController.getLogsByUser(): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new java.util.ArrayList<>());
        }
    }
}
