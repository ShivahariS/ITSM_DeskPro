package com.itsm.asset.entity;

import com.itsm.asset.enums.LicenseStatus;
import com.itsm.asset.enums.LicenseType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "software_licenses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SoftwareLicense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("licenseID")
    private Long licenseID;

    @Column(nullable = false)
    private String softwareName;

    private String vendor;

    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LicenseStatus status = LicenseStatus.ACTIVE;

    @JsonProperty("assignedToID")
    private Long assignedToID;
}
