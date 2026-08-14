package com.itsm.notification.service.impl;

import com.itsm.notification.entity.Notification;
import com.itsm.notification.enums.NotificationCategory;
import com.itsm.notification.enums.NotificationStatus;
import com.itsm.notification.exception.ResourceNotFoundException;
import com.itsm.notification.repository.NotificationRepository;
import com.itsm.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(Long userID, String message, NotificationCategory category) {
        notificationRepository.save(Notification.builder()
                .userID(userID).message(message).category(category).build());
    }

    @Override
    public List<Notification> getMyNotifications(Long userID) {
        return notificationRepository.findByUserIDOrderByCreatedDateDesc(userID);
    }

    @Override
    public Notification markAsRead(Long notificationID, Long userID) {
        Notification n = getOwned(notificationID, userID);
        n.setStatus(NotificationStatus.READ);
        return notificationRepository.save(n);
    }

    @Override
    public Notification dismiss(Long notificationID, Long userID) {
        Notification n = getOwned(notificationID, userID);
        n.setStatus(NotificationStatus.DISMISSED);
        return notificationRepository.save(n);
    }

    @Override
    public long countUnread(Long userID) {
        return notificationRepository.countByUserIDAndStatus(userID, NotificationStatus.UNREAD);
    }

    private Notification getOwned(Long notificationID, Long userID) {
        Notification n = notificationRepository.findById(notificationID)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationID));
        if (!n.getUserID().equals(userID)) {
            throw new ResourceNotFoundException("Notification not found: " + notificationID);
        }
        return n;
    }
}
