package com.itsm.identity.service;

import com.itsm.identity.entity.AuditLog;
import java.util.List;

public interface AuditService {
    void log(Long userID, String action, String entityType, Long recordID);
    List<AuditLog> getAll();
    List<AuditLog> getByUser(Long userID);
}
