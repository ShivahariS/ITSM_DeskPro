package com.itsm.notification.controller;

import com.itsm.notification.entity.Notification;
import com.itsm.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notification management")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get my notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal Long userID) {
        return ResponseEntity.ok(notificationService.getMyNotifications(userID));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal Long userID) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.countUnread(userID)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<Notification> markRead(@PathVariable Long id,
                                                 @AuthenticationPrincipal Long userID) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userID));
    }

    @PatchMapping("/{id}/dismiss")
    @Operation(summary = "Dismiss notification")
    public ResponseEntity<Notification> dismiss(@PathVariable Long id,
                                                @AuthenticationPrincipal Long userID) {
        return ResponseEntity.ok(notificationService.dismiss(id, userID));
    }
}
