package com.itsm.asset.repository;

import com.itsm.asset.entity.AssetRecord;
import com.itsm.asset.enums.AssetStatus;
import com.itsm.asset.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AssetRecordRepository extends JpaRepository<AssetRecord, Long> {
    List<AssetRecord> findByAssignedToID(Long assignedToID);
    List<AssetRecord> findByStatus(AssetStatus status);
    List<AssetRecord> findByAssetType(AssetType assetType);
    List<AssetRecord> findByWarrantyExpiryBefore(LocalDate date);
}
