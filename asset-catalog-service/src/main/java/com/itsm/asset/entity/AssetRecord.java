package com.itsm.asset.entity;

import com.itsm.asset.enums.AssetStatus;
import com.itsm.asset.enums.AssetType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "asset_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssetRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assetID;

    @Enumerated(EnumType.STRING)
    private AssetType assetType;

    private String make;
    private String model;

    @Column(unique = true)
    private String serialNumber;

    private Long assignedToID;
    private String locationID;
    private LocalDate purchaseDate;
    private LocalDate warrantyExpiry;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AssetStatus status = AssetStatus.IN_STOCK;
}
