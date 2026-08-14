package com.itsm.incident.repository;

import com.itsm.incident.entity.KnownError;
import com.itsm.incident.enums.KnownErrorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface KnownErrorRepository extends JpaRepository<KnownError, Long> {
    List<KnownError> findByProblemID(Long problemID);
    List<KnownError> findByStatus(KnownErrorStatus status);
}
