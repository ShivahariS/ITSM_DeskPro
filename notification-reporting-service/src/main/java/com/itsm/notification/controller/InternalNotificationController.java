package com.itsm.notification.controller;

import com.itsm.notification.enums.NotificationCategory;
import com.itsm.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Service-to-service only. Other services used to fire NotificationService.createNotification(...)
 * in-process, or publish a notification.request event; now they POST here instead.
 * Guarded by InternalApiKeyFilter, not by end-user JWTs.
 */
@RestController
@RequestMapping("/api/internal/notifications")
@RequiredArgsConstructor
@Tag(name = "Internal - Notification Requests", description = "Service-to-service notification creation")
public class InternalNotificationController {

    private final NotificationService notificationService;

    public record NotificationRequest(Long userID, String message, String category) {}

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody NotificationRequest req) {
        notificationService.createNotification(req.userID(), req.message(), NotificationCategory.valueOf(req.category()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
