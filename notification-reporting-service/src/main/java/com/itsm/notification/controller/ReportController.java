package com.itsm.notification.controller;

import com.itsm.notification.entity.ITSMReport;
import com.itsm.notification.enums.ReportScope;
import com.itsm.notification.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/reports", "/api/v1/reports"})
@RequiredArgsConstructor
@Tag(name = "ITSM Analytics & Reports", description = "Generate and retrieve ITSM reports")
@PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','CHANGE_MANAGER','ASSET_MANAGER','ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/generate")
    @Operation(summary = "Generate ITSM report")
    public ResponseEntity<ITSMReport> generate(@RequestParam ReportScope scope,
                                               @RequestParam(required = false) String scopeValue) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.generateReport(scope, scopeValue));
    }

    @GetMapping
    @Operation(summary = "Get all reports")
    public ResponseEntity<List<ITSMReport>> getAll() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/incident-summary")
    @Operation(summary = "Generate and retrieve incident summary metrics")
    public ResponseEntity<Map<String, Object>> getIncidentSummary() {
        return ResponseEntity.ok(reportService.getIncidentSummary());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get report by ID")
    public ResponseEntity<ITSMReport> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }
}
