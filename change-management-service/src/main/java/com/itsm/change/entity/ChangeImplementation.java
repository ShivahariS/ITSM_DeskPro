package com.itsm.change.entity;

import com.itsm.change.enums.ImplementationOutcome;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "change_implementations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChangeImplementation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long implementationID;

    private Long changeID;
    private Long implementedByID;
    private LocalDateTime actualStartDate;
    private LocalDateTime actualEndDate;

    @Enumerated(EnumType.STRING)
    private ImplementationOutcome outcome;

    @Column(length = 2000)
    private String pirComments;
}
