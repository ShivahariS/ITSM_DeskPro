package com.itsm.notification.service;

import com.itsm.notification.entity.Notification;
import com.itsm.notification.enums.NotificationCategory;
import com.itsm.notification.enums.NotificationStatus;

import java.util.List;

public interface NotificationService {
    void createNotification(Long userID, String message, NotificationCategory category);
    List<Notification> getMyNotifications(Long userID);
    Notification markAsRead(Long notificationID, Long userID);
    Notification dismiss(Long notificationID, Long userID);
    long countUnread(Long userID);
}
