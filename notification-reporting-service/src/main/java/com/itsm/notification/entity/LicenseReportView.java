package com.itsm.notification.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "license_report_view")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LicenseReportView {

    @Id
    private Long licenseID;

    private String status;
}
