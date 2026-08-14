package com.itsm.change.repository;

import com.itsm.change.entity.ChangeRequest;
import com.itsm.change.enums.ChangeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {
    List<ChangeRequest> findByRequestedByID(Long requestedByID);
    List<ChangeRequest> findByStatus(ChangeStatus status);
}
