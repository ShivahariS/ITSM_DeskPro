package com.itsm.asset.repository;

import com.itsm.asset.entity.ServiceCatalogItem;
import com.itsm.asset.enums.CatalogCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceCatalogItemRepository extends JpaRepository<ServiceCatalogItem, Long> {
    List<ServiceCatalogItem> findByActiveTrue();
    List<ServiceCatalogItem> findByCategory(CatalogCategory category);
}
