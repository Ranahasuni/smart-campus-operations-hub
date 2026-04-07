package com.smartcampus.controller;

import com.smartcampus.model.AuditLog;
import com.smartcampus.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for viewing Audit Logs — ADMIN only.
 */
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@CrossOrigin
public class LogController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditService.getAllLogs());
    }

    @GetMapping("/user/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getLogsByUser(@PathVariable String id) {
        return ResponseEntity.ok(auditService.getLogsByUser(id));
    }
}
