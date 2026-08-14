package com.itsm.change.service.impl;

import com.itsm.change.dto.request.CABReviewRequest;
import com.itsm.change.dto.request.ChangeRequestRequest;
import com.itsm.change.dto.request.ImplementationRequest;
import com.itsm.change.entity.CABReview;
import com.itsm.change.entity.ChangeImplementation;
import com.itsm.change.entity.ChangeRequest;
import com.itsm.change.enums.CABDecision;
import com.itsm.change.enums.ChangeStatus;
import com.itsm.change.enums.ReviewStatus;
import com.itsm.change.enums.RiskLevel;
import com.itsm.change.exception.BadRequestException;
import com.itsm.change.exception.ResourceNotFoundException;
import com.itsm.change.repository.CABReviewRepository;
import com.itsm.change.repository.ChangeImplementationRepository;
import com.itsm.change.repository.ChangeRequestRepository;
import com.itsm.change.client.UserDirectoryClient;
import com.itsm.change.client.NotificationServiceClient;
import com.itsm.change.client.ReportEventClient;
import com.itsm.change.client.ReportEventClient.ChangeImplementationRequest;
import com.itsm.change.service.ChangeManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChangeManagementServiceImpl implements ChangeManagementService {

    private final ChangeRequestRepository changeRepo;
    private final CABReviewRepository cabReviewRepo;
    private final ChangeImplementationRepository implRepo;
    private final NotificationServiceClient notificationService;
    private final UserDirectoryClient userDirectoryClient;
    private final ReportEventClient reportEventPublisher;

    @Override
    public ChangeRequest createChangeRequest(ChangeRequestRequest req, Long requestedByID) {
        return changeRepo.save(ChangeRequest.builder()
                .requestedByID(requestedByID)
                .title(req.title())
                .description(req.description())
                .changeType(req.changeType())
                .impactAssessment(req.impactAssessment())
                .riskLevel(req.riskLevel() != null ? req.riskLevel() : RiskLevel.MEDIUM)
                .rollbackPlan(req.rollbackPlan())
                .plannedStartDate(req.plannedStartDate())
                .plannedEndDate(req.plannedEndDate())
                .build());
    }

    @Override
    public ChangeRequest getChangeById(Long id) {
        return changeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Change request not found: " + id));
    }

    @Override
    public List<ChangeRequest> getAllChanges() {
        return changeRepo.findAll();
    }

    @Override
    public List<ChangeRequest> getChangesByStatus(ChangeStatus status) {
        return changeRepo.findByStatus(status);
    }

    @Override
    public ChangeRequest updateChangeStatus(Long id, ChangeStatus status) {
        ChangeRequest cr = getChangeById(id);
        cr.setStatus(status);
        return changeRepo.save(cr);
    }

    @Override
    public ChangeRequest submitForCAB(Long id) {
        ChangeRequest cr = getChangeById(id);
        if (cr.getStatus() != ChangeStatus.DRAFT && cr.getStatus() != ChangeStatus.SUBMITTED) {
            throw new BadRequestException("Change can only be submitted from DRAFT status.");
        }
        cr.setStatus(ChangeStatus.CAB_REVIEW);
        ChangeRequest saved = changeRepo.save(cr);
        List<Long> cabMemberIds = userDirectoryClient.findUserIdsByRole("CHANGE_MANAGER");
        List<Long> cabTeamIds = userDirectoryClient.findUserIdsByTeam(4L);
        java.util.Set<Long> userIdsToNotify = new java.util.HashSet<>();
        userIdsToNotify.addAll(cabMemberIds);
        userIdsToNotify.addAll(cabTeamIds);
        for (Long uid : userIdsToNotify) {
            notificationService.createNotification(uid, "Change request CHG-" + id + " requires CAB approval.", com.itsm.change.enums.NotificationCategory.CHANGE);
        }
        return saved;
    }

    @Override
    public CABReview conductCABReview(Long changeID, CABReviewRequest req, Long reviewerID) {
        ChangeRequest cr = getChangeById(changeID);
        CABReview review = CABReview.builder()
                .changeID(changeID)
                .reviewDate(req.reviewDate())
                .attendeeIDs(req.attendeeIDs())
                .decision(req.decision())
                .comments(req.comments())
                .status(ReviewStatus.COMPLETED)
                .build();
        review = cabReviewRepo.save(review);
        // update change status based on decision
        if (req.decision() == CABDecision.APPROVED) {
            cr.setStatus(ChangeStatus.APPROVED);
        } else if (req.decision() == CABDecision.REJECTED) {
            cr.setStatus(ChangeStatus.REJECTED);
        }
        changeRepo.save(cr);
        notificationService.createNotification(cr.getRequestedByID(),
                "CAB review completed. Your change request CHG-" + changeID + " has been " + req.decision() + ".",
                com.itsm.change.enums.NotificationCategory.CHANGE);
        return review;
    }

    @Override
    public List<CABReview> getCABReviews(Long changeID) {
        return cabReviewRepo.findByChangeID(changeID);
    }

    @Override
    public ChangeImplementation recordImplementation(Long changeID, ImplementationRequest req, Long implementedByID) {
        ChangeRequest cr = getChangeById(changeID);
        if (cr.getStatus() != ChangeStatus.APPROVED && cr.getStatus() != ChangeStatus.SCHEDULED) {
            throw new BadRequestException("Change must be APPROVED or SCHEDULED before implementation.");
        }
        ChangeImplementation impl = ChangeImplementation.builder()
                .changeID(changeID)
                .implementedByID(implementedByID)
                .actualStartDate(req.actualStartDate())
                .actualEndDate(req.actualEndDate())
                .outcome(req.outcome())
                .pirComments(req.pirComments())
                .build();
        impl = implRepo.save(impl);
        cr.setStatus(ChangeStatus.PIR_PENDING);
        changeRepo.save(cr);
        reportEventPublisher.publishChangeImplementation(new ChangeImplementationRequest(
                impl.getImplementationID(), changeID, impl.getOutcome() != null ? impl.getOutcome().name() : null));
        return impl;
    }

    @Override
    public ChangeImplementation getImplementation(Long changeID) {
        return implRepo.findByChangeID(changeID)
                .orElseThrow(() -> new ResourceNotFoundException("Implementation not found for change: " + changeID));
    }
}
