package com.itsm.incident.service.impl;

import com.itsm.incident.client.UserDirectoryClient;
import com.itsm.incident.dto.request.*;
import com.itsm.incident.entity.Incident;
import com.itsm.incident.entity.IncidentNote;
import com.itsm.incident.entity.SatisfactionScore;
import com.itsm.incident.enums.IncidentStatus;
import com.itsm.incident.enums.NoteType;
import com.itsm.incident.enums.NotificationCategory;
import com.itsm.incident.enums.Priority;
import com.itsm.incident.exception.BadRequestException;
import com.itsm.incident.exception.ResourceNotFoundException;
import com.itsm.incident.client.AuditServiceClient;
import com.itsm.incident.client.NotificationServiceClient;
import com.itsm.incident.client.ReportEventClient;
import com.itsm.incident.client.ReportEventClient.IncidentChangedRequest;
import com.itsm.incident.repository.IncidentNoteRepository;
import com.itsm.incident.repository.IncidentRepository;
import com.itsm.incident.repository.SatisfactionScoreRepository;
import com.itsm.incident.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentNoteRepository noteRepository;
    private final SatisfactionScoreRepository scoreRepository;

    // Formerly in-process AuditService / NotificationService / UserRepository -
    // now synchronous REST clients to identity-service and notification-reporting-service.
    private final AuditServiceClient auditEventPublisher;
    private final NotificationServiceClient notificationService;
    private final UserDirectoryClient userDirectoryClient;
    private final ReportEventClient reportEventPublisher;

    @Override
    public Incident createIncident(IncidentRequest req, Long reporterID) {
        Priority priority = req.priority() != null ? req.priority() : Priority.P3;

        int slaHours = switch (priority) { case P1 -> 4; case P2 -> 8; case P3 -> 24; case P4 -> 72; };
        Incident incident = Incident.builder()
                .reporterID(reporterID)
                .description(req.description())
                .category(req.category())
                .priority(priority)
                .slaDueDate(LocalDateTime.now().plusHours(slaHours))
                .build();
        incident = incidentRepository.save(incident);
        auditEventPublisher.log(reporterID, "CREATE", "Incident", incident.getIncidentID());
        notificationService.createNotification(reporterID,
                "Your incident INC-" + incident.getIncidentID() + " has been logged.",
                NotificationCategory.INCIDENT);

        // Notify support users based on priority (L1 for all, L2 only for P1/P2)
        List<Long> supportUserIdsToNotify = new java.util.ArrayList<>();
        supportUserIdsToNotify.addAll(userDirectoryClient.findUserIdsByRole("L1_SUPPORT"));
        if (priority == Priority.P1 || priority == Priority.P2) {
            supportUserIdsToNotify.addAll(userDirectoryClient.findUserIdsByRole("L2_SUPPORT"));
        }
        for (Long userId : supportUserIdsToNotify) {
            notificationService.createNotification(userId,
                    "A new incident INC-" + incident.getIncidentID() + " has been submitted by User with ID " + reporterID + ".",
                    NotificationCategory.INCIDENT);
        }

        publishIncidentChanged(incident);
        return incident;
    }

    @Override
    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));
    }

    @Override
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    @Override
    public List<Incident> getMyIncidents(Long reporterID) {
        return incidentRepository.findByReporterID(reporterID);
    }

    @Override
    public List<Incident> getAssignedIncidents(Long engineerID) {
        return incidentRepository.findByAssignedToID(engineerID);
    }

    @Override
    public List<Incident> getIncidentsByStatus(IncidentStatus status) {
        return incidentRepository.findByStatus(status);
    }

    @Override
    public Incident assignIncident(Long id, Long assignedToID, Long teamID) {
        Incident incident = getIncidentById(id);
        incident.setAssignedToID(assignedToID);
        incident.setAssignedTeamID(teamID);
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        Incident saved = incidentRepository.save(incident);
        notificationService.createNotification(assignedToID, "Incident INC-" + id + " has been assigned to you.", NotificationCategory.INCIDENT);
        publishIncidentChanged(saved);
        return saved;
    }

    @Override
    public Incident escalateIncident(Long id, EscalateRequest req, Long authorID) {
        Incident incident = getIncidentById(id);
        incident.setAssignedToID(req.assignedToID());
        if (req.assignedTeamID() != null) incident.setAssignedTeamID(req.assignedTeamID());
        incident.setStatus(IncidentStatus.IN_PROGRESS);
        IncidentNote note = IncidentNote.builder()
                .incidentID(id)
                .authorID(authorID)
                .noteText("Escalated: " + (req.reason() != null ? req.reason() : "No reason provided"))
                .noteType(NoteType.ESCALATION)
                .build();
        noteRepository.save(note);
        Incident saved = incidentRepository.save(incident);
        notificationService.createNotification(req.assignedToID(), "Incident INC-" + id + " has been assigned to you.", NotificationCategory.INCIDENT);
        notificationService.createNotification(saved.getReporterID(), "Your incident INC-" + id + " status has been updated to IN_PROGRESS.", NotificationCategory.INCIDENT);
        publishIncidentChanged(saved);
        return saved;
    }

    @Override
    public Incident resolveIncident(Long id, String resolutionNote, Long authorID) {
        Incident incident = getIncidentById(id);
        if (incident.getStatus() == IncidentStatus.CLOSED) {
            throw new BadRequestException("Cannot resolve a closed incident.");
        }
        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolutionDate(LocalDateTime.now());
        IncidentNote note = IncidentNote.builder()
                .incidentID(id).authorID(authorID)
                .noteText(resolutionNote != null ? resolutionNote : "Incident resolved.")
                .noteType(NoteType.PUBLIC_UPDATE)
                .build();
        noteRepository.save(note);
        notificationService.createNotification(incident.getReporterID(),
                "Your incident INC-" + id + " has been resolved. Please rate your experience.",
                NotificationCategory.INCIDENT);
        Incident saved = incidentRepository.save(incident);
        publishIncidentChanged(saved);
        return saved;
    }

    @Override
    public Incident closeIncident(Long id) {
        Incident incident = getIncidentById(id);
        incident.setStatus(IncidentStatus.CLOSED);
        Incident saved = incidentRepository.save(incident);
        notificationService.createNotification(saved.getReporterID(), "Your incident INC-" + id + " has been closed.", NotificationCategory.INCIDENT);
        publishIncidentChanged(saved);
        return saved;
    }

    @Override
    public Incident reopenIncident(Long id) {
        Incident incident = getIncidentById(id);
        incident.setStatus(IncidentStatus.REOPENED);
        incident.setResolutionDate(null);
        Incident saved = incidentRepository.save(incident);
        notificationService.createNotification(saved.getReporterID(), "Your incident INC-" + id + " has been reopened.", NotificationCategory.INCIDENT);
        publishIncidentChanged(saved);
        return saved;
    }

    @Override
    public IncidentNote addNote(Long incidentID, IncidentNoteRequest req, Long authorID) {
        Incident incident = getIncidentById(incidentID); // validate exists
        IncidentNote saved = noteRepository.save(IncidentNote.builder()
                .incidentID(incidentID)
                .authorID(authorID)
                .noteText(req.noteText())
                .noteType(req.noteType())
                .build());
        publishIncidentChanged(incident); // refreshes the denormalized noteCount for reporting
        return saved;
    }

    @Override
    public List<IncidentNote> getNotes(Long incidentID) {
        getIncidentById(incidentID);
        return noteRepository.findByIncidentIDOrderByCreatedDateAsc(incidentID);
    }

    @Override
    public SatisfactionScore submitSatisfaction(Long incidentID, SatisfactionRequest req, Long userID) {
        Incident incident = getIncidentById(incidentID);
        if (incident.getStatus() != IncidentStatus.RESOLVED && incident.getStatus() != IncidentStatus.CLOSED) {
            throw new BadRequestException("Satisfaction can only be submitted for resolved/closed incidents.");
        }
        if (scoreRepository.findByIncidentIDAndUserID(incidentID, userID).isPresent()) {
            throw new BadRequestException("Satisfaction already submitted for this incident.");
        }
        return scoreRepository.save(SatisfactionScore.builder()
                .incidentID(incidentID)
                .userID(userID)
                .rating(req.rating())
                .feedback(req.feedback())
                .build());
    }

    private void publishIncidentChanged(Incident incident) {
        long noteCount = noteRepository.findByIncidentIDOrderByCreatedDateAsc(incident.getIncidentID()).size();
        reportEventPublisher.publishIncidentChanged(new IncidentChangedRequest(
                incident.getIncidentID(),
                incident.getStatus() != null ? incident.getStatus().name() : null,
                incident.getCategory() != null ? incident.getCategory().name() : null,
                incident.getPriority() != null ? incident.getPriority().name() : null,
                incident.getAssignedTeamID(),
                incident.getReporterID(),
                incident.getLoggedDate(),
                incident.getResolutionDate(),
                noteCount
        ));
    }
}
