package com.itsm.incident.entity;

import com.itsm.incident.enums.IncidentCategory;
import com.itsm.incident.enums.IncidentStatus;
import com.itsm.incident.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long incidentID;

    private Long reporterID;

    @Enumerated(EnumType.STRING)
    private IncidentCategory category;

    @Column(length = 4000, nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Priority priority = Priority.P3;

    private Long assignedTeamID;
    private Long assignedToID;

    @Builder.Default
    private LocalDateTime loggedDate = LocalDateTime.now();

    private LocalDateTime resolutionDate;
    private LocalDateTime slaDueDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.OPEN;
}
