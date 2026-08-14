package com.itsm.change.entity;

import com.itsm.change.enums.ChangeStatus;
import com.itsm.change.enums.ChangeType;
import com.itsm.change.enums.RiskLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "change_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long changeID;

    private Long requestedByID;

    @Enumerated(EnumType.STRING)
    private ChangeType changeType;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String description;

    @Column(length = 2000)
    private String impactAssessment;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RiskLevel riskLevel = RiskLevel.MEDIUM;

    @Column(length = 2000)
    private String rollbackPlan;

    private LocalDateTime plannedStartDate;
    private LocalDateTime plannedEndDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ChangeStatus status = ChangeStatus.DRAFT;
}
