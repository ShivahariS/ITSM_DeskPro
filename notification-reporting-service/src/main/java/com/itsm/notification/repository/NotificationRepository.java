package com.itsm.notification.repository;

import com.itsm.notification.entity.Notification;
import com.itsm.notification.enums.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIDOrderByCreatedDateDesc(Long userID);
    List<Notification> findByUserIDAndStatus(Long userID, NotificationStatus status);
    long countByUserIDAndStatus(Long userID, NotificationStatus status);
    boolean existsByUserIDAndMessageContaining(Long userID, String part);
}
