package com.itsm.asset.entity;

import com.itsm.asset.enums.CatalogCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_catalog_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceCatalogItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long itemID;

    @Column(nullable = false)
    private String serviceName;

    @Enumerated(EnumType.STRING)
    private CatalogCategory category;

    @Column(length = 2000)
    private String description;

    private Integer fulfilmentSLAHours;

    @Builder.Default
    private Boolean approvalRequired = false;

    private Long deliveryTeamID;

    @Builder.Default
    private Boolean active = true;
}
