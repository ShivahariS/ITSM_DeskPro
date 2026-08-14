package com.itsm.notification.service;

import com.itsm.notification.entity.ITSMReport;
import com.itsm.notification.enums.ReportScope;

import java.util.List;

public interface ReportService {
    ITSMReport generateReport(ReportScope scope, String scopeValue);
    List<ITSMReport> getAllReports();
    ITSMReport getReportById(Long id);
    java.util.Map<String, Object> getIncidentSummary();
}
