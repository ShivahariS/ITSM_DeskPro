package com.itsm.notification.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "problem_report_view")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProblemReportView {

    @Id
    private Long problemID;

    private String status;

    @Column(length = 2000)
    private String linkedIncidentIDs;
}
