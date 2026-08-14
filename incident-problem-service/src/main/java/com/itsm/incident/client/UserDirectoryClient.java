package com.itsm.incident.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

/**
 * Thin REST client to identity-service, replacing the direct UserRepository access this
 * service used to have. Reads are synchronous (a directory lookup, not an event), while
 * writes/notifications elsewhere in this service go over RabbitMQ.
 */
@Component
@Slf4j
public class UserDirectoryClient {

    private final RestTemplate restTemplate;

    @Value("${services.identity.url}")
    private String identityBaseUrl;

    @Value("${app.internal.api-key}")
    private String internalApiKey;

    public UserDirectoryClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<Long> findUserIdsByRole(String role) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            Long[] ids = restTemplate.exchange(
                    identityBaseUrl + "/api/internal/users/by-role/" + role,
                    HttpMethod.GET, entity, Long[].class).getBody();
            return ids != null ? Arrays.asList(ids) : List.of();
        } catch (Exception e) {
            log.warn("Could not reach identity-service to resolve users by role {}: {}", role, e.getMessage());
            return List.of();
        }
    }
}
