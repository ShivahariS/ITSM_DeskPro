package com.itsm.identity.repository;

import com.itsm.identity.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserIDOrderByTimestampDesc(Long userID);
    List<AuditLog> findByEntityTypeOrderByTimestampDesc(String entityType);
}
