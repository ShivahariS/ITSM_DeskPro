package com.itsm.incident.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

/**
 * Pushes denormalized incident/problem snapshots to notification-reporting-service's report
 * read-model, replacing the old report.incident.changed / report.problem.changed RabbitMQ events.
 */
@Component
@Slf4j
public class ReportEventClient {

    private final RestTemplate restTemplate;

    @Value("${services.notification.url}")
    private String notificationBaseUrl;

    @Value("${app.internal.api-key}")
    private String internalApiKey;

    public ReportEventClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public record IncidentChangedRequest(
            Long incidentID, String status, String category, String priority,
            Long teamID, Long reporterID, LocalDateTime loggedDate,
            LocalDateTime resolutionDate, long noteCount) {}

    public record ProblemChangedRequest(Long problemID, String status, String linkedIncidentIDs) {}

    public void publishIncidentChanged(IncidentChangedRequest event) {
        post("/api/internal/report-events/incident-changed", event);
    }

    public void publishProblemChanged(ProblemChangedRequest event) {
        post("/api/internal/report-events/problem-changed", event);
    }

    private void post(String path, Object body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            restTemplate.postForEntity(notificationBaseUrl + path, new HttpEntity<>(body, headers), Void.class);
        } catch (Exception e) {
            log.warn("Could not push report event to notification-reporting-service ({}): {}", path, e.getMessage());
        }
    }
}
