package com.itsm.incident.service.impl;

import com.itsm.incident.dto.request.KnownErrorRequest;
import com.itsm.incident.dto.request.ProblemRequest;
import com.itsm.incident.entity.KnownError;
import com.itsm.incident.entity.ProblemRecord;
import com.itsm.incident.enums.ProblemPriority;
import com.itsm.incident.enums.ProblemStatus;
import com.itsm.incident.exception.ResourceNotFoundException;
import com.itsm.incident.repository.KnownErrorRepository;
import com.itsm.incident.repository.ProblemRecordRepository;
import com.itsm.incident.client.NotificationServiceClient;
import com.itsm.incident.client.ReportEventClient;
import com.itsm.incident.client.ReportEventClient.ProblemChangedRequest;
import com.itsm.incident.service.ProblemService;
import com.itsm.incident.enums.NotificationCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemServiceImpl implements ProblemService {

    private final ProblemRecordRepository problemRepo;
    private final KnownErrorRepository knownErrorRepo;
    private final NotificationServiceClient notificationService;
    private final ReportEventClient reportEventPublisher;

    @Override
    public ProblemRecord createProblem(ProblemRequest req, Long createdByID) {
        ProblemRecord problem = problemRepo.save(ProblemRecord.builder()
                .title(req.title())
                .description(req.description())
                .linkedIncidentIDs(req.linkedIncidentIDs())
                .priority(req.priority() != null ? req.priority() : ProblemPriority.MEDIUM)
                .assignedToID(req.assignedToID() != null ? req.assignedToID() : createdByID)
                .build());
        if (problem.getAssignedToID() != null) {
            notificationService.createNotification(problem.getAssignedToID(),
                    "Problem Record PRB-" + problem.getProblemID() + " has been assigned to you.",
                    NotificationCategory.PROBLEM);
        }
        publishProblemChanged(problem);
        return problem;
    }

    @Override
    public ProblemRecord getProblemById(Long id) {
        return problemRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem record not found: " + id));
    }

    @Override
    public List<ProblemRecord> getAllProblems() {
        return problemRepo.findAll();
    }

    @Override
    public ProblemRecord updateProblem(Long id, ProblemRequest req) {
        ProblemRecord p = getProblemById(id);
        p.setTitle(req.title());
        if (req.description() != null) p.setDescription(req.description());
        if (req.linkedIncidentIDs() != null) p.setLinkedIncidentIDs(req.linkedIncidentIDs());
        if (req.priority() != null) p.setPriority(req.priority());
        Long prevAssigned = p.getAssignedToID();
        if (req.assignedToID() != null) p.setAssignedToID(req.assignedToID());
        ProblemRecord saved = problemRepo.save(p);
        if (req.assignedToID() != null && !req.assignedToID().equals(prevAssigned)) {
            notificationService.createNotification(req.assignedToID(),
                    "Problem Record PRB-" + id + " has been assigned to you.",
                    NotificationCategory.PROBLEM);
        }
        publishProblemChanged(saved);
        return saved;
    }

    @Override
    public ProblemRecord updateProblemStatus(Long id, ProblemStatus status, String rootCause) {
        ProblemRecord p = getProblemById(id);
        p.setStatus(status);
        boolean rootCauseUpdated = false;
        if (rootCause != null && !rootCause.equals(p.getRootCause())) {
            p.setRootCause(rootCause);
            rootCauseUpdated = true;
        }
        if (status == ProblemStatus.RESOLVED || status == ProblemStatus.CLOSED) {
            p.setResolvedDate(LocalDateTime.now());
        }
        ProblemRecord saved = problemRepo.save(p);
        if (rootCauseUpdated && saved.getAssignedToID() != null) {
            notificationService.createNotification(saved.getAssignedToID(),
                    "Root cause updated for Problem Record PRB-" + id + ".",
                    NotificationCategory.PROBLEM);
        }
        publishProblemChanged(saved);
        return saved;
    }

    @Override
    public KnownError createKnownError(KnownErrorRequest req) {
        getProblemById(req.problemID()); // validate problem exists
        return knownErrorRepo.save(KnownError.builder()
                .problemID(req.problemID())
                .description(req.description())
                .workaround(req.workaround())
                .permanentFixETA(req.permanentFixETA())
                .build());
    }

    @Override
    public KnownError getKnownErrorById(Long id) {
        return knownErrorRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Known error not found: " + id));
    }

    @Override
    public List<KnownError> getKnownErrorsByProblem(Long problemID) {
        return knownErrorRepo.findByProblemID(problemID);
    }

    @Override
    public List<KnownError> getAllKnownErrors() {
        return knownErrorRepo.findAll();
    }

    @Override
    public KnownError updateKnownError(Long id, KnownErrorRequest req) {
        KnownError ke = getKnownErrorById(id);
        ke.setDescription(req.description());
        if (req.workaround() != null) ke.setWorkaround(req.workaround());
        if (req.permanentFixETA() != null) ke.setPermanentFixETA(req.permanentFixETA());
        return knownErrorRepo.save(ke);
    }

    private void publishProblemChanged(ProblemRecord p) {
        reportEventPublisher.publishProblemChanged(new ProblemChangedRequest(
                p.getProblemID(),
                p.getStatus() != null ? p.getStatus().name() : null,
                p.getLinkedIncidentIDs()
        ));
    }
}
