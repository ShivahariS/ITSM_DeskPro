package com.itsm.incident.repository;

import com.itsm.incident.entity.Incident;
import com.itsm.incident.enums.IncidentStatus;
import com.itsm.incident.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByReporterID(Long reporterID);
    List<Incident> findByAssignedToID(Long assignedToID);
    List<Incident> findByAssignedTeamID(Long teamID);
    List<Incident> findByStatus(IncidentStatus status);
    List<Incident> findByPriority(Priority priority);
    List<Incident> findByStatusNot(IncidentStatus status);
}
