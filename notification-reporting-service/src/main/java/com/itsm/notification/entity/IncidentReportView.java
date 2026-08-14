package com.itsm.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Read-only local replica of the incident fields needed for reporting/analytics.
 * Populated asynchronously from IncidentChangedEvent (event-carried state transfer) so this
 * service never has to query incident-problem-service's database directly.
 */
@Entity
@Table(name = "incident_report_view")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentReportView {

    @Id
    private Long incidentID;

    private String status;
    private String category;
    private String priority;
    private Long teamID;
    private Long reporterID;
    private LocalDateTime loggedDate;
    private LocalDateTime resolutionDate;
    private long noteCount;
}
