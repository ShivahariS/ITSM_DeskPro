package com.itsm.notification.entity;

import com.itsm.notification.enums.ReportScope;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "itsm_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ITSMReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportID;

    @Enumerated(EnumType.STRING)
    private ReportScope scope;

    private Long ticketCount;
    private Double slaComplianceRate;
    private Double mttr;
    private Double firstCallResolutionRate;
    private Double changeSuccessRate;
    private Double problemRecurrenceRate;
    private Double licenseCompliancePercent;

    private String scopeValue;

    @Builder.Default
    private LocalDateTime generatedDate = LocalDateTime.now();
}
