package com.itsm.incident.entity;

import com.itsm.incident.enums.ProblemPriority;
import com.itsm.incident.enums.ProblemStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "problem_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProblemRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long problemID;

    @Column(length = 1000)
    private String linkedIncidentIDs;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String description;

    private Long assignedToID;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProblemPriority priority = ProblemPriority.MEDIUM;

    @Column(length = 4000)
    private String rootCause;

    @Builder.Default
    private LocalDateTime raisedDate = LocalDateTime.now();

    private LocalDateTime resolvedDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProblemStatus status = ProblemStatus.OPEN;
}
