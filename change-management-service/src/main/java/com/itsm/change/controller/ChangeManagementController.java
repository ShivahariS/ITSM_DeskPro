package com.itsm.change.controller;

import com.itsm.change.dto.request.CABReviewRequest;
import com.itsm.change.dto.request.ChangeRequestRequest;
import com.itsm.change.dto.request.ImplementationRequest;
import com.itsm.change.entity.CABReview;
import com.itsm.change.entity.ChangeImplementation;
import com.itsm.change.entity.ChangeRequest;
import com.itsm.change.enums.ChangeStatus;
import com.itsm.change.service.ChangeManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/changes")
@RequiredArgsConstructor
@Tag(name = "Change Management", description = "Change requests, CAB reviews, and implementations")
public class ChangeManagementController {

    private final ChangeManagementService changeService;

    @PostMapping
    @Operation(summary = "Create change request")
    public ResponseEntity<ChangeRequest> create(@Valid @RequestBody ChangeRequestRequest req,
                                                @AuthenticationPrincipal Long userID) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(changeService.createChangeRequest(req, userID));
    }

    @GetMapping
    @Operation(summary = "Get all change requests")
    public ResponseEntity<List<ChangeRequest>> getAll() {
        return ResponseEntity.ok(changeService.getAllChanges());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get change request by ID")
    public ResponseEntity<ChangeRequest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(changeService.getChangeById(id));
    }

    @GetMapping("/by-status")
    @Operation(summary = "Get changes by status")
    public ResponseEntity<List<ChangeRequest>> getByStatus(@RequestParam ChangeStatus status) {
        return ResponseEntity.ok(changeService.getChangesByStatus(status));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit change for CAB review")
    public ResponseEntity<ChangeRequest> submit(@PathVariable Long id) {
        return ResponseEntity.ok(changeService.submitForCAB(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('CHANGE_MANAGER','ADMIN')")
    @Operation(summary = "Update change status [Change Manager/Admin]")
    public ResponseEntity<ChangeRequest> updateStatus(@PathVariable Long id,
                                                      @RequestParam ChangeStatus status) {
        return ResponseEntity.ok(changeService.updateChangeStatus(id, status));
    }

    @PostMapping("/{id}/cab-review")
    @PreAuthorize("hasAnyRole('CHANGE_MANAGER','ADMIN')")
    @Operation(summary = "Conduct CAB review [Change Manager/Admin]")
    public ResponseEntity<CABReview> conductCAB(@PathVariable Long id,
                                                @Valid @RequestBody CABReviewRequest req,
                                                @AuthenticationPrincipal Long userID) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(changeService.conductCABReview(id, req, userID));
    }

    @GetMapping("/{id}/cab-reviews")
    @Operation(summary = "Get CAB reviews for a change")
    public ResponseEntity<List<CABReview>> getCABReviews(@PathVariable Long id) {
        return ResponseEntity.ok(changeService.getCABReviews(id));
    }

    @PostMapping("/{id}/implementation")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','CHANGE_MANAGER','ADMIN')")
    @Operation(summary = "Record change implementation")
    public ResponseEntity<ChangeImplementation> recordImpl(@PathVariable Long id,
                                                           @Valid @RequestBody ImplementationRequest req,
                                                           @AuthenticationPrincipal Long userID) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(changeService.recordImplementation(id, req, userID));
    }

    @GetMapping("/{id}/implementation")
    @Operation(summary = "Get implementation details")
    public ResponseEntity<ChangeImplementation> getImpl(@PathVariable Long id) {
        return ResponseEntity.ok(changeService.getImplementation(id));
    }
}
