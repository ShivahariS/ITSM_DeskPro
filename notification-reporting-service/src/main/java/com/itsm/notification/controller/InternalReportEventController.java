package com.itsm.notification.controller;

import com.itsm.notification.entity.ChangeImplReportView;
import com.itsm.notification.entity.IncidentReportView;
import com.itsm.notification.entity.LicenseReportView;
import com.itsm.notification.entity.ProblemReportView;
import com.itsm.notification.repository.ChangeImplReportViewRepository;
import com.itsm.notification.repository.IncidentReportViewRepository;
import com.itsm.notification.repository.LicenseReportViewRepository;
import com.itsm.notification.repository.ProblemReportViewRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Service-to-service only. incident-problem-service, change-management-service, and
 * asset-catalog-service call these endpoints whenever a relevant record changes, so this
 * service's local read-model replicas (used by ReportServiceImpl) stay up to date without
 * reaching into another service's database directly.
 *
 * This replaces what used to be async RabbitMQ events (report.incident.changed etc.) - the
 * call is now synchronous, made right after the source service saves its own record.
 * Guarded by InternalApiKeyFilter, not by end-user JWTs.
 */
@RestController
@RequestMapping("/api/internal/report-events")
@RequiredArgsConstructor
@Tag(name = "Internal - Report Events", description = "Service-to-service report read-model updates")
public class InternalReportEventController {

    private final IncidentReportViewRepository incidentViewRepo;
    private final ProblemReportViewRepository problemViewRepo;
    private final ChangeImplReportViewRepository changeImplViewRepo;
    private final LicenseReportViewRepository licenseViewRepo;

    public record IncidentChangedRequest(
            Long incidentID, String status, String category, String priority,
            Long teamID, Long reporterID, LocalDateTime loggedDate,
            LocalDateTime resolutionDate, long noteCount) {}

    public record ProblemChangedRequest(Long problemID, String status, String linkedIncidentIDs) {}

    public record ChangeImplementationRequest(Long implementationID, Long changeRequestID, String outcome) {}

    public record LicenseChangedRequest(Long licenseID, String status) {}

    @PostMapping("/incident-changed")
    public ResponseEntity<Void> incidentChanged(@RequestBody IncidentChangedRequest req) {
        incidentViewRepo.save(IncidentReportView.builder()
                .incidentID(req.incidentID())
                .status(req.status())
                .category(req.category())
                .priority(req.priority())
                .teamID(req.teamID())
                .reporterID(req.reporterID())
                .loggedDate(req.loggedDate())
                .resolutionDate(req.resolutionDate())
                .noteCount(req.noteCount())
                .build());
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/problem-changed")
    public ResponseEntity<Void> problemChanged(@RequestBody ProblemChangedRequest req) {
        problemViewRepo.save(ProblemReportView.builder()
                .problemID(req.problemID())
                .status(req.status())
                .linkedIncidentIDs(req.linkedIncidentIDs())
                .build());
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/change-implementation")
    public ResponseEntity<Void> changeImplementationRecorded(@RequestBody ChangeImplementationRequest req) {
        changeImplViewRepo.save(ChangeImplReportView.builder()
                .implementationID(req.implementationID())
                .changeRequestID(req.changeRequestID())
                .outcome(req.outcome())
                .build());
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @PostMapping("/license-changed")
    public ResponseEntity<Void> licenseChanged(@RequestBody LicenseChangedRequest req) {
        licenseViewRepo.save(LicenseReportView.builder()
                .licenseID(req.licenseID())
                .status(req.status())
                .build());
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
