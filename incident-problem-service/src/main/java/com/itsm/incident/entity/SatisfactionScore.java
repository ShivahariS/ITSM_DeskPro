package com.itsm.incident.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "satisfaction_scores")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SatisfactionScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scoreID;

    private Long incidentID;
    private Long userID;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 2000)
    private String feedback;

    @Builder.Default
    private LocalDateTime submittedDate = LocalDateTime.now();
}
