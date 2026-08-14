package com.itsm.incident.entity;

import com.itsm.incident.enums.NoteType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incident_notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long noteID;

    private Long incidentID;
    private Long authorID;

    @Column(length = 4000, nullable = false)
    private String noteText;

    @Enumerated(EnumType.STRING)
    private NoteType noteType;

    @Builder.Default
    private LocalDateTime createdDate = LocalDateTime.now();
}
