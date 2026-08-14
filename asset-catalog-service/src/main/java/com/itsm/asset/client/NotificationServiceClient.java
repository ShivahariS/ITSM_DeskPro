package com.itsm.asset.client;

import com.itsm.asset.enums.NotificationCategory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class NotificationServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.notification.url}")
    private String notificationBaseUrl;

    @Value("${app.internal.api-key}")
    private String internalApiKey;

    public NotificationServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public record NotificationRequest(Long userID, String message, String category) {}

    public void createNotification(Long userID, String message, NotificationCategory category) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<NotificationRequest> entity = new HttpEntity<>(
                    new NotificationRequest(userID, message, category.name()), headers);
            restTemplate.postForEntity(notificationBaseUrl + "/api/internal/notifications", entity, Void.class);
        } catch (Exception e) {
            log.warn("Could not deliver notification to notification-reporting-service: {}", e.getMessage());
        }
    }
}
