package com.itsm.change.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

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
        return fetch("/api/internal/users/by-role/" + role);
    }

    public List<Long> findUserIdsByTeam(Long teamId) {
        return fetch("/api/internal/users/by-team/" + teamId);
    }

    private List<Long> fetch(String path) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Api-Key", internalApiKey);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            Long[] ids = restTemplate.exchange(identityBaseUrl + path, HttpMethod.GET, entity, Long[].class).getBody();
            return ids != null ? Arrays.asList(ids) : List.of();
        } catch (Exception e) {
            log.warn("Could not reach identity-service at {}: {}", path, e.getMessage());
            return List.of();
        }
    }
}
