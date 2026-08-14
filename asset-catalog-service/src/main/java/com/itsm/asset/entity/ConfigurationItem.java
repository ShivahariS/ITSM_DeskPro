package com.itsm.asset.entity;

import com.itsm.asset.enums.CIStatus;
import com.itsm.asset.enums.Environment;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "configuration_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConfigurationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ciID;

    @Column(nullable = false)
    private String ciName;

    private String ciType;
    private Long linkedAssetID;
    private String owner;

    @Enumerated(EnumType.STRING)
    private Environment environment;

    @Column(length = 1000)
    private String dependsOnCIIDs;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CIStatus status = CIStatus.ACTIVE;
}
