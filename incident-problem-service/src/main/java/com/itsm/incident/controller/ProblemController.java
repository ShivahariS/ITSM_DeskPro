package com.itsm.incident.controller;

import com.itsm.incident.dto.request.KnownErrorRequest;
import com.itsm.incident.dto.request.ProblemRequest;
import com.itsm.incident.entity.KnownError;
import com.itsm.incident.entity.ProblemRecord;
import com.itsm.incident.enums.ProblemStatus;
import com.itsm.incident.service.ProblemService;
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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Problem Management", description = "Problem records and known error database")
public class ProblemController {

    private final ProblemService problemService;

    @PostMapping("/problems")
    @PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Create problem record [L2/L3/Admin]")
    public ResponseEntity<ProblemRecord> create(@Valid @RequestBody ProblemRequest req,
                                                @AuthenticationPrincipal Long userID) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(problemService.createProblem(req, userID));
    }

    @GetMapping("/problems")
    @PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Get all problems [L2/L3/Admin]")
    public ResponseEntity<List<ProblemRecord>> getAll() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/problems/{id}")
    @PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Get problem by ID")
    public ResponseEntity<ProblemRecord> getById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PutMapping("/problems/{id}")
    @PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Update problem record")
    public ResponseEntity<ProblemRecord> update(@PathVariable Long id,
                                                @Valid @RequestBody ProblemRequest req) {
        return ResponseEntity.ok(problemService.updateProblem(id, req));
    }

    @PatchMapping("/problems/{id}/status")
    @PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Update problem status")
    public ResponseEntity<ProblemRecord> updateStatus(@PathVariable Long id,
                                                      @RequestParam ProblemStatus status,
                                                      @RequestBody(required = false) Map<String, String> body) {
        String rootCause = body != null ? body.get("rootCause") : null;
        return ResponseEntity.ok(problemService.updateProblemStatus(id, status, rootCause));
    }

    @PostMapping("/known-errors")
    @PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Create known error record")
    public ResponseEntity<KnownError> createKE(@Valid @RequestBody KnownErrorRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemService.createKnownError(req));
    }

    @GetMapping("/known-errors")
    @Operation(summary = "Get all known errors")
    public ResponseEntity<List<KnownError>> getAllKE() {
        return ResponseEntity.ok(problemService.getAllKnownErrors());
    }

    @GetMapping("/known-errors/{id}")
    @Operation(summary = "Get known error by ID")
    public ResponseEntity<KnownError> getKEById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getKnownErrorById(id));
    }

    @GetMapping("/problems/{problemID}/known-errors")
    @Operation(summary = "Get known errors for a problem")
    public ResponseEntity<List<KnownError>> getKEByProblem(@PathVariable Long problemID) {
        return ResponseEntity.ok(problemService.getKnownErrorsByProblem(problemID));
    }

    @PutMapping("/known-errors/{id}")
    @PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','ADMIN')")
    @Operation(summary = "Update known error")
    public ResponseEntity<KnownError> updateKE(@PathVariable Long id,
                                               @Valid @RequestBody KnownErrorRequest req) {
        return ResponseEntity.ok(problemService.updateKnownError(id, req));
    }
}
