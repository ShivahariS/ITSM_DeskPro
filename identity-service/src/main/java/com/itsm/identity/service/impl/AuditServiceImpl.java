package com.itsm.identity.service.impl;

import com.itsm.identity.entity.AuditLog;
import com.itsm.identity.repository.AuditLogRepository;
import com.itsm.identity.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void log(Long userID, String action, String entityType, Long recordID) {
        auditLogRepository.save(AuditLog.builder()
                .userID(userID)
                .action(action)
                .entityType(entityType)
                .recordID(recordID)
                .build());
    }

    @Override
    public List<AuditLog> getAll() {
        return auditLogRepository.findAll();
    }

    @Override
    public List<AuditLog> getByUser(Long userID) {
        return auditLogRepository.findByUserIDOrderByTimestampDesc(userID);
    }
}
