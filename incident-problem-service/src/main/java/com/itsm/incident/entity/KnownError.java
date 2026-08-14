package com.itsm.incident.entity;

import com.itsm.incident.enums.KnownErrorStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "known_errors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KnownError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long keID;

    private Long problemID;

    @Column(length = 4000, nullable = false)
    private String description;

    @Column(length = 2000)
    private String workaround;

    private LocalDate permanentFixETA;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KnownErrorStatus status = KnownErrorStatus.ACTIVE;
}
