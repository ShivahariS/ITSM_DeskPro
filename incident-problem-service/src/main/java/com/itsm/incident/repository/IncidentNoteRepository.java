package com.itsm.incident.repository;

import com.itsm.incident.entity.IncidentNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentNoteRepository extends JpaRepository<IncidentNote, Long> {
    List<IncidentNote> findByIncidentIDOrderByCreatedDateAsc(Long incidentID);
    long countByIncidentID(Long incidentID);
}
