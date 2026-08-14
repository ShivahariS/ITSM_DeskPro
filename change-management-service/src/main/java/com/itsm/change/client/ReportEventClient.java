package com.itsm.change.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

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

    public record ChangeImplementationRequest(Long implementationID, Long changeRequestID, String outcome) {}

    public void publishChangeImplementation(ChangeImplementationRequest event) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            restTemplate.postForEntity(notificationBaseUrl + "/api/internal/report-events/change-implementation",
                    new HttpEntity<>(event, headers), Void.class);
        } catch (Exception e) {
            log.warn("Could not push change implementation report event: {}", e.getMessage());
        }
    }
}
