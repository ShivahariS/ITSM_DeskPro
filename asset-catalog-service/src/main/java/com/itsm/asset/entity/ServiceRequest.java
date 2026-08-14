package com.itsm.asset.entity;

import com.itsm.asset.enums.ServiceRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestID;

    private Long requesterID;
    private Long catalogItemID;

    @Column(length = 2000)
    private String details;

    @Builder.Default
    private LocalDateTime submissionDate = LocalDateTime.now();

    private Long assignedToID;
    private LocalDateTime fulfilmentDueDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ServiceRequestStatus status = ServiceRequestStatus.SUBMITTED;
}
