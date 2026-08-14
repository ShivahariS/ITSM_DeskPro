package com.itsm.notification.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "change_impl_report_view")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChangeImplReportView {

    @Id
    private Long implementationID;

    private Long changeRequestID;
    private String outcome;
}
