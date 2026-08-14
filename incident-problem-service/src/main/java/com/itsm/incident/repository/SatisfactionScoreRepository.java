package com.itsm.incident.repository;

import com.itsm.incident.entity.SatisfactionScore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SatisfactionScoreRepository extends JpaRepository<SatisfactionScore, Long> {
    Optional<SatisfactionScore> findByIncidentIDAndUserID(Long incidentID, Long userID);
    List<SatisfactionScore> findByIncidentID(Long incidentID);
}
