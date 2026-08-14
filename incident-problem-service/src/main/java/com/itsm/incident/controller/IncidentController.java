package com.itsm.incident.controller;

import com.itsm.incident.dto.request.*;
import com.itsm.incident.entity.*;
import com.itsm.incident.enums.IncidentStatus;
import com.itsm.incident.service.IncidentService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Incident Management", description = "Log, assign, escalate, and resolve incidents")
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('END_USER','L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Log a new incident")
    public ResponseEntity<Incident> create(@Valid @RequestBody IncidentRequest req,
                                           @AuthenticationPrincipal Long userID) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(incidentService.createIncident(req, userID));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Get all incidents [Support/Admin]")
    public ResponseEntity<List<Incident>> getAll() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/my")
    @Operation(summary = "Get my reported incidents")
    public ResponseEntity<List<Incident>> getMyIncidents(@AuthenticationPrincipal Long userID) {
        return ResponseEntity.ok(incidentService.getMyIncidents(userID));
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT')")
    @Operation(summary = "Get incidents assigned to me")
    public ResponseEntity<List<Incident>> getAssigned(@AuthenticationPrincipal Long userID) {
        return ResponseEntity.ok(incidentService.getAssignedIncidents(userID));
    }

    @GetMapping("/by-status")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Get incidents by status")
    public ResponseEntity<List<Incident>> getByStatus(@RequestParam IncidentStatus status) {
        return ResponseEntity.ok(incidentService.getIncidentsByStatus(status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get incident by ID")
    public ResponseEntity<Incident> getById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Assign incident [Support/Admin]")
    public ResponseEntity<Incident> assign(@PathVariable Long id,
                                           @RequestParam Long assignedToID,
                                           @RequestParam(required = false) Long teamID) {
        return ResponseEntity.ok(incidentService.assignIncident(id, assignedToID, teamID));
    }

    @PostMapping("/{id}/escalate")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Escalate incident")
    public ResponseEntity<Incident> escalate(@PathVariable Long id,
                                             @Valid @RequestBody EscalateRequest req,
                                             @AuthenticationPrincipal Long userID) {
        return ResponseEntity.ok(incidentService.escalateIncident(id, req, userID));
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Resolve incident")
    public ResponseEntity<Incident> resolve(@PathVariable Long id,
                                            @RequestBody(required = false) Map<String, String> body,
                                            @AuthenticationPrincipal Long userID) {
        String note = body != null ? body.get("resolutionNote") : null;
        return ResponseEntity.ok(incidentService.resolveIncident(id, note, userID));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Close incident")
    public ResponseEntity<Incident> close(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.closeIncident(id));
    }

    @PostMapping("/{id}/reopen")
    @PreAuthorize("hasAnyRole('END_USER','L1_SUPPORT','L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Reopen incident")
    public ResponseEntity<Incident> reopen(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.reopenIncident(id));
    }

    @PostMapping("/{id}/notes")
    @Operation(summary = "Add note to incident")
    public ResponseEntity<IncidentNote> addNote(@PathVariable Long id,
                                                @Valid @RequestBody IncidentNoteRequest req,
                                                @AuthenticationPrincipal Long userID) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(incidentService.addNote(id, req, userID));
    }

    @GetMapping("/{id}/notes")
    @Operation(summary = "Get incident notes")
    public ResponseEntity<List<IncidentNote>> getNotes(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getNotes(id));
    }

    @PostMapping("/{id}/satisfaction")
    @PreAuthorize("hasRole('END_USER')")
    @Operation(summary = "Submit satisfaction rating [END_USER]")
    public ResponseEntity<SatisfactionScore> submitSatisfaction(@PathVariable Long id,
                                                                 @Valid @RequestBody SatisfactionRequest req,
                                                                 @AuthenticationPrincipal Long userID) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(incidentService.submitSatisfaction(id, req, userID));
    }
}
