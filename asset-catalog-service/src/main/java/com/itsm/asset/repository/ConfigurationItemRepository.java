package com.itsm.asset.repository;

import com.itsm.asset.entity.ConfigurationItem;
import com.itsm.asset.enums.CIStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConfigurationItemRepository extends JpaRepository<ConfigurationItem, Long> {
    List<ConfigurationItem> findByStatus(CIStatus status);
    List<ConfigurationItem> findByLinkedAssetID(Long assetID);
}
