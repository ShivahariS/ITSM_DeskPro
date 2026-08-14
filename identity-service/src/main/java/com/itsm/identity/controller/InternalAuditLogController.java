package com.itsm.identity.controller;

import com.itsm.identity.service.AuditService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Service-to-service only. Other services used to write audit rows directly (same JVM);
 * now they POST here instead, since identity-service owns the AuditLog table.
 * Guarded by InternalApiKeyFilter, not by end-user JWTs.
 */
@RestController
@RequestMapping("/api/internal/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Internal - Audit Log Ingestion", description = "Service-to-service audit log writes")
public class InternalAuditLogController {

    private final AuditService auditService;

    public record AuditLogRequest(Long userID, String action, String entityType, Long recordID) {}

    @PostMapping
    public ResponseEntity<Void> record(@RequestBody AuditLogRequest req) {
        auditService.log(req.userID(), req.action(), req.entityType(), req.recordID());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
