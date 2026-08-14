package com.itsm.incident.repository;

import com.itsm.incident.entity.ProblemRecord;
import com.itsm.incident.enums.ProblemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProblemRecordRepository extends JpaRepository<ProblemRecord, Long> {
    List<ProblemRecord> findByAssignedToID(Long assignedToID);
    List<ProblemRecord> findByStatus(ProblemStatus status);
}
