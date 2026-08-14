package com.itsm.asset.repository;

import com.itsm.asset.entity.ServiceRequest;
import com.itsm.asset.enums.ServiceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByRequesterID(Long requesterID);
    List<ServiceRequest> findByAssignedToID(Long assignedToID);
    List<ServiceRequest> findByStatus(ServiceRequestStatus status);
}
