package com.itsm.identity.controller;

import com.itsm.identity.entity.AuditLog;
import com.itsm.identity.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "System audit trail [ADMIN only]")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Get all audit logs [ADMIN]")
    public ResponseEntity<List<AuditLog>> getAll() {
        return ResponseEntity.ok(auditService.getAll());
    }

    @GetMapping("/user/{userID}")
    @Operation(summary = "Get audit logs by user [ADMIN]")
    public ResponseEntity<List<AuditLog>> getByUser(@PathVariable Long userID) {
        return ResponseEntity.ok(auditService.getByUser(userID));
    }
}
