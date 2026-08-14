package com.itsm.notification.service.impl;

import com.itsm.notification.entity.ChangeImplReportView;
import com.itsm.notification.entity.IncidentReportView;
import com.itsm.notification.entity.ITSMReport;
import com.itsm.notification.entity.LicenseReportView;
import com.itsm.notification.entity.ProblemReportView;
import com.itsm.notification.enums.ReportScope;
import com.itsm.notification.repository.*;
import com.itsm.notification.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Rewritten for the microservices split. The monolith's ReportServiceImpl used to read
 * IncidentRepository / IncidentNoteRepository / SoftwareLicenseRepository /
 * ChangeImplementationRepository / ProblemRecordRepository directly - those tables now live in
 * other services' databases. Instead, this reads from local replica tables
 * (IncidentReportView, ProblemReportView, ChangeImplReportView, LicenseReportView) that are kept
 * up to date asynchronously via RabbitMQ (see ReportEventListener). The calculations themselves
 * are unchanged from the original implementation.
 */
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ITSMReportRepository reportRepo;
    private final IncidentReportViewRepository incidentViewRepo;
    private final ProblemReportViewRepository problemViewRepo;
    private final ChangeImplReportViewRepository changeImplViewRepo;
    private final LicenseReportViewRepository licenseViewRepo;

    @Override
    public ITSMReport generateReport(ReportScope scope, String scopeValue) {
        List<IncidentReportView> filteredIncidents = getFilteredIncidents(scope, scopeValue);
        long total = filteredIncidents.size();

        long resolved = filteredIncidents.stream()
                .filter(i -> "RESOLVED".equals(i.getStatus()) || "CLOSED".equals(i.getStatus()))
                .count();
        double slaCompliance = total > 0 ? (resolved * 100.0 / total) : 0.0;

        long totalLicenses = licenseViewRepo.count();
        long activeLicenses = licenseViewRepo.findAll().stream()
                .filter(l -> "ACTIVE".equals(l.getStatus())).count();
        double licenseCompliance = totalLicenses > 0 ? (activeLicenses * 100.0 / totalLicenses) : 0.0;

        // Calculate MTTR
        List<IncidentReportView> resolvedIncidents = filteredIncidents.stream()
                .filter(i -> "RESOLVED".equals(i.getStatus()) || "CLOSED".equals(i.getStatus()))
                .filter(i -> i.getResolutionDate() != null && i.getLoggedDate() != null)
                .toList();
        double totalHours = 0;
        int resolvedCount = 0;
        for (IncidentReportView i : resolvedIncidents) {
            java.time.Duration duration = java.time.Duration.between(i.getLoggedDate(), i.getResolutionDate());
            totalHours += duration.toHours();
            resolvedCount++;
        }
        double mttr = resolvedCount > 0 ? (totalHours / resolvedCount) : 0.0;

        // Calculate FCR Rate (noteCount is denormalized onto the replica by the publishing service)
        long fcrCount = 0;
        for (IncidentReportView i : resolvedIncidents) {
            if (i.getNoteCount() <= 1) {
                fcrCount++;
            }
        }
        double fcrRate = !resolvedIncidents.isEmpty() ? (fcrCount * 100.0 / resolvedIncidents.size()) : 0.0;

        // Calculate Change Success Rate
        List<ChangeImplReportView> impls = changeImplViewRepo.findAll();
        long successCount = impls.stream()
                .filter(impl -> "SUCCESSFUL".equals(impl.getOutcome()) || "PARTIALLY_SUCCESSFUL".equals(impl.getOutcome()))
                .count();
        double changeSuccessRate = !impls.isEmpty() ? (successCount * 100.0 / impls.size()) : 0.0;

        // Calculate Problem Recurrence Rate
        List<ProblemReportView> problems = problemViewRepo.findAll();
        long recurringCount = 0;
        for (ProblemReportView p : problems) {
            String ids = p.getLinkedIncidentIDs();
            if (ids != null && !ids.trim().isEmpty()) {
                String[] split = ids.split(",");
                if (split.length > 1) {
                    recurringCount++;
                }
            }
        }
        double problemRecurrence = !problems.isEmpty() ? (recurringCount * 100.0 / problems.size()) : 0.0;

        ITSMReport report = ITSMReport.builder()
                .scope(scope)
                .scopeValue(scopeValue)
                .ticketCount(total)
                .slaComplianceRate(slaCompliance)
                .mttr(mttr)
                .firstCallResolutionRate(fcrRate)
                .changeSuccessRate(changeSuccessRate)
                .problemRecurrenceRate(problemRecurrence)
                .licenseCompliancePercent(licenseCompliance)
                .build();
        return reportRepo.save(report);
    }

    private List<IncidentReportView> getFilteredIncidents(ReportScope scope, String scopeValue) {
        List<IncidentReportView> all = incidentViewRepo.findAll();
        if (scope == null || scopeValue == null || scopeValue.trim().isEmpty()) {
            return all;
        }

        String val = scopeValue.trim();
        return all.stream().filter(i -> {
            switch (scope) {
                case TEAM:
                    try {
                        Long teamId = Long.parseLong(val);
                        return i.getTeamID() != null && i.getTeamID().equals(teamId);
                    } catch (NumberFormatException e) {
                        return true;
                    }
                case CATEGORY:
                    return i.getCategory() != null && i.getCategory().equalsIgnoreCase(val);
                case PRIORITY:
                    return i.getPriority() != null && i.getPriority().equalsIgnoreCase(val);
                case PERIOD:
                    return matchesPeriod(i.getLoggedDate(), val);
                default:
                    return true;
            }
        }).toList();
    }

    private boolean matchesPeriod(java.time.LocalDateTime loggedDate, String val) {
        if (loggedDate == null) return false;
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        switch (val.toUpperCase()) {
            case "LAST_7_DAYS":
            case "7":
                return loggedDate.isAfter(now.minusDays(7));
            case "LAST_30_DAYS":
            case "30":
                return loggedDate.isAfter(now.minusDays(30));
            case "LAST_90_DAYS":
            case "90":
                return loggedDate.isAfter(now.minusDays(90));
            case "THIS_YEAR":
            case "365":
                return loggedDate.getYear() == now.getYear();
            default:
                return true;
        }
    }

    @Override
    public List<ITSMReport> getAllReports() {
        return reportRepo.findAllByOrderByGeneratedDateDesc();
    }

    @Override
    public ITSMReport getReportById(Long id) {
        return reportRepo.findById(id)
                .orElseThrow(() -> new com.itsm.notification.exception.ResourceNotFoundException("Report not found: " + id));
    }

    @Override
    public Map<String, Object> getIncidentSummary() {
        List<IncidentReportView> allIncidents = incidentViewRepo.findAll();
        long total = allIncidents.size();
        long open = allIncidents.stream().filter(i -> "OPEN".equals(i.getStatus())).count();
        long inProgress = allIncidents.stream().filter(i -> "IN_PROGRESS".equals(i.getStatus())).count();
        long resolved = allIncidents.stream().filter(i -> "RESOLVED".equals(i.getStatus())).count();
        long closed = allIncidents.stream().filter(i -> "CLOSED".equals(i.getStatus())).count();
        long reopened = allIncidents.stream().filter(i -> "REOPENED".equals(i.getStatus())).count();

        long resolvedOrClosed = resolved + closed;
        double slaComplianceRate = total > 0 ? (resolvedOrClosed * 100.0 / total) : 0.0;

        List<IncidentReportView> resolvedIncidents = allIncidents.stream()
                .filter(i -> "RESOLVED".equals(i.getStatus()) || "CLOSED".equals(i.getStatus()))
                .filter(i -> i.getResolutionDate() != null && i.getLoggedDate() != null)
                .toList();
        double totalHours = 0;
        int resolvedCount = 0;
        for (IncidentReportView i : resolvedIncidents) {
            java.time.Duration duration = java.time.Duration.between(i.getLoggedDate(), i.getResolutionDate());
            totalHours += duration.toHours();
            resolvedCount++;
        }
        double mttr = resolvedCount > 0 ? (totalHours / resolvedCount) : 0.0;

        long fcrCount = 0;
        for (IncidentReportView i : resolvedIncidents) {
            if (i.getNoteCount() <= 1) {
                fcrCount++;
            }
        }
        double fcrRate = !resolvedIncidents.isEmpty() ? (fcrCount * 100.0 / resolvedIncidents.size()) : 0.0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalIncidents", total);
        summary.put("openIncidents", open);
        summary.put("inProgressIncidents", inProgress);
        summary.put("resolvedIncidents", resolved);
        summary.put("closedIncidents", closed);
        summary.put("reopenedIncidents", reopened);
        summary.put("slaComplianceRate", slaComplianceRate);
        summary.put("mttr", mttr);
        summary.put("firstCallResolutionRate", fcrRate);

        return summary;
    }
}
