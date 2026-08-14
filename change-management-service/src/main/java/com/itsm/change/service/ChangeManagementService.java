package com.itsm.change.service;

import com.itsm.change.dto.request.CABReviewRequest;
import com.itsm.change.dto.request.ChangeRequestRequest;
import com.itsm.change.dto.request.ImplementationRequest;
import com.itsm.change.entity.CABReview;
import com.itsm.change.entity.ChangeImplementation;
import com.itsm.change.entity.ChangeRequest;
import com.itsm.change.enums.ChangeStatus;

import java.util.List;

public interface ChangeManagementService {
    ChangeRequest createChangeRequest(ChangeRequestRequest request, Long requestedByID);
    ChangeRequest getChangeById(Long id);
    List<ChangeRequest> getAllChanges();
    List<ChangeRequest> getChangesByStatus(ChangeStatus status);
    ChangeRequest updateChangeStatus(Long id, ChangeStatus status);
    ChangeRequest submitForCAB(Long id);

    CABReview conductCABReview(Long changeID, CABReviewRequest request, Long reviewerID);
    List<CABReview> getCABReviews(Long changeID);

    ChangeImplementation recordImplementation(Long changeID, ImplementationRequest request, Long implementedByID);
    ChangeImplementation getImplementation(Long changeID);
}
