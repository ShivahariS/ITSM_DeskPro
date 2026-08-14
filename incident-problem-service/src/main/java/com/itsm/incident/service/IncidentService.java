package com.itsm.incident.service;

import com.itsm.incident.dto.request.*;
import com.itsm.incident.entity.Incident;
import com.itsm.incident.entity.IncidentNote;
import com.itsm.incident.entity.SatisfactionScore;
import com.itsm.incident.enums.IncidentStatus;

import java.util.List;

public interface IncidentService {
    Incident createIncident(IncidentRequest request, Long reporterID);
    Incident getIncidentById(Long id);
    List<Incident> getAllIncidents();
    List<Incident> getMyIncidents(Long reporterID);
    List<Incident> getAssignedIncidents(Long engineerID);
    List<Incident> getIncidentsByStatus(IncidentStatus status);
    Incident assignIncident(Long id, Long assignedToID, Long teamID);
    Incident escalateIncident(Long id, EscalateRequest request, Long authorID);
    Incident resolveIncident(Long id, String resolutionNote, Long authorID);
    Incident closeIncident(Long id);
    Incident reopenIncident(Long id);
    IncidentNote addNote(Long incidentID, IncidentNoteRequest request, Long authorID);
    List<IncidentNote> getNotes(Long incidentID);
    SatisfactionScore submitSatisfaction(Long incidentID, SatisfactionRequest request, Long userID);
}
