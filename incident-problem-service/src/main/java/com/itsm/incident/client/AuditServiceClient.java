package com.itsm.incident.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Drop-in replacement for the old in-process AuditService.log(...) call (and, before that,
 * the audit.log RabbitMQ event). Same method signature, now a synchronous POST to
 * identity-service, which owns the AuditLog table.
 */
@Component
@Slf4j
public class AuditServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.identity.url}")
    private String identityBaseUrl;

    @Value("${app.internal.api-key}")
    private String internalApiKey;

    public AuditServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public record AuditLogRequest(Long userID, String action, String entityType, Long recordID) {}

    public void log(Long userID, String action, String entityType, Long recordID) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            HttpEntity<AuditLogRequest> entity = new HttpEntity<>(new AuditLogRequest(userID, action, entityType, recordID), headers);
            restTemplate.postForEntity(identityBaseUrl + "/api/internal/audit-logs", entity, Void.class);
        } catch (Exception e) {
            // Audit logging is best-effort - never let it block the primary business operation.
            log.warn("Could not write audit log to identity-service: {}", e.getMessage());
        }
    }
}
