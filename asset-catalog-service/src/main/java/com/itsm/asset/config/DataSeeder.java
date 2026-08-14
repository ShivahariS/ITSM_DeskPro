package com.itsm.asset.config;

import com.itsm.asset.client.UserDirectoryClient;
import com.itsm.asset.entity.AssetRecord;
import com.itsm.asset.entity.ServiceCatalogItem;
import com.itsm.asset.enums.AssetStatus;
import com.itsm.asset.enums.AssetType;
import com.itsm.asset.enums.CatalogCategory;
import com.itsm.asset.repository.AssetRecordRepository;
import com.itsm.asset.repository.ServiceCatalogItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Seeds the Service Catalog and Hardware Asset inventory for ITSMDeskPro on startup.
 *
 * <p>Moved out of the old monolith's DataSeeder - this service owns ServiceCatalogItem and
 * AssetRecord. Two of the seed assets are pre-assigned to a user ("End User" and "L1 Support"),
 * but this service no longer owns the User table, so those IDs are resolved over REST from
 * identity-service (by role) via UserDirectoryClient instead of a local repository lookup.
 * This means identity-service must already be up - and have already run its own seeder -
 * before this seeder runs, otherwise those two assets are created unassigned instead of
 * failing outright (best-effort, matching the rest of this service's cross-service calls).</p>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final Long TEAM_SERVICE_DESK = 1L;
    private static final Long TEAM_ASSET        = 5L;

    private static final String LOC_HQ     = "Headquarters - Building A";
    private static final String LOC_REMOTE = "Remote / Work From Home";

    private final ServiceCatalogItemRepository catalogItemRepository;
    private final AssetRecordRepository assetRepository;
    private final UserDirectoryClient userDirectoryClient;

    @Override
    public void run(String... args) {
        if (catalogItemRepository.count() > 0 || assetRepository.count() > 0) {
            log.info("=== asset-catalog-service: data already present, skipping seed ===");
            return;
        }

        seedCatalogItems();
        seedAssets();
    }

    // ---------------------------------------------------------------------
    // Service Catalog (covers all 5 categories)
    // ---------------------------------------------------------------------
    private void seedCatalogItems() {
        catalog("New Developer Laptop", CatalogCategory.HARDWARE,
                "Request a laptop for development work.",
                48, true, TEAM_ASSET);
        catalog("Figma License", CatalogCategory.SOFTWARE,
                "Request allocation of a Figma license seat for design work.",
                24, true, TEAM_ASSET);
        catalog("Adobe License", CatalogCategory.SOFTWARE,
                "Request allocation of an Adobe Creative Cloud license seat for design and media production.",
                24, true, TEAM_ASSET);
        catalog("Claude License", CatalogCategory.SOFTWARE,
                "Request allocation of a Claude Pro/Team license seat for AI assistance.",
                24, true, TEAM_ASSET);
        catalog("VPN access configuration", CatalogCategory.NETWORK,
                "Configure corporate VPN client access with multi-factor authentication tokens.",
                12, false, TEAM_SERVICE_DESK);
        catalog("Reset Password Request", CatalogCategory.ACCESS,
                "Reset your enterprise account password.",
                2, false, TEAM_SERVICE_DESK);
        catalog("Refresh Access Request", CatalogCategory.ACCESS,
                "Request a review and refresh of current role entitlements and resource access permissions.",
                12, true, TEAM_SERVICE_DESK);
        catalog("Request new ID card", CatalogCategory.OTHER,
                "Submit a request for a new physical employee identification badge or replacement card.",
                8, false, TEAM_SERVICE_DESK);

        log.info("=== asset-catalog-service: Service Catalog Seeded ({} items) ===", catalogItemRepository.count());
    }

    private void catalog(String serviceName, CatalogCategory category, String description,
                          int slaHours, boolean approvalRequired, Long deliveryTeamID) {
        catalogItemRepository.save(ServiceCatalogItem.builder()
                .serviceName(serviceName)
                .category(category)
                .description(description)
                .fulfilmentSLAHours(slaHours)
                .approvalRequired(approvalRequired)
                .deliveryTeamID(deliveryTeamID)
                .active(true)
                .build());
    }

    // ---------------------------------------------------------------------
    // Hardware inventory
    // ---------------------------------------------------------------------
    private void seedAssets() {
        Long endUserID = firstUserIdOrNull("END_USER");
        Long l1UserID = firstUserIdOrNull("L1_SUPPORT");

        assetRepository.save(AssetRecord.builder()
                .assetType(AssetType.LAPTOP)
                .make("Acer")
                .model("TravelLite")
                .serialNumber("MBP-2026-001")
                .assignedToID(endUserID)
                .locationID(LOC_REMOTE)
                .purchaseDate(LocalDate.of(2026, 1, 15))
                .warrantyExpiry(LocalDate.of(2027, 12, 31))
                .status(AssetStatus.IN_USE)
                .build());

        assetRepository.save(AssetRecord.builder()
                .assetType(AssetType.PRINTER)
                .make("Dell")
                .model("UltraSharp 27\" Monitor (U2723QE)")
                .serialNumber("DEL-2026-089")
                .locationID("HQ Storage Room B")
                .purchaseDate(LocalDate.of(2026, 2, 3))
                .warrantyExpiry(LocalDate.of(2028, 2, 3))
                .status(AssetStatus.IN_STOCK)
                .build());

        assetRepository.save(AssetRecord.builder()
                .assetType(AssetType.NETWORK_DEVICE)
                .make("Cisco")
                .model("Core Edge Router 7700-X")
                .serialNumber("CSC-7700-X")
                .locationID("HQ Data Center")
                .purchaseDate(LocalDate.of(2025, 6, 10))
                .warrantyExpiry(LocalDate.of(2029, 6, 10))
                .status(AssetStatus.IN_USE)
                .build());

        assetRepository.save(AssetRecord.builder()
                .assetType(AssetType.SERVER)
                .make("Dell")
                .model("PowerEdge R760 (Auth/DB Node)")
                .serialNumber("SRV-2025-014")
                .locationID("HQ Data Center")
                .purchaseDate(LocalDate.of(2025, 3, 20))
                .warrantyExpiry(LocalDate.of(2028, 3, 20))
                .status(AssetStatus.IN_USE)
                .build());

        assetRepository.save(AssetRecord.builder()
                .assetType(AssetType.MOBILE_DEVICE)
                .make("Apple")
                .model("iPhone 15 Pro (Field Kit)")
                .serialNumber("IPH-2024-233")
                .assignedToID(l1UserID)
                .locationID(LOC_HQ)
                .purchaseDate(LocalDate.of(2024, 8, 10))
                .warrantyExpiry(LocalDate.of(2027, 8, 10))
                .status(AssetStatus.IN_USE)
                .build());

        assetRepository.save(AssetRecord.builder()
                .assetType(AssetType.LAPTOP)
                .make("Lenovo")
                .model("ThinkPad X1 Carbon Gen 11")
                .serialNumber("LEN-2025-077")
                .locationID("HQ Storage Room B")
                .purchaseDate(LocalDate.of(2025, 5, 1))
                .warrantyExpiry(LocalDate.of(2028, 5, 1))
                .status(AssetStatus.UNDER_REPAIR)
                .build());

        log.info("=== asset-catalog-service: Hardware Assets Seeded ({}) ===", assetRepository.count());
        if (endUserID == null || l1UserID == null) {
            log.warn("Could not resolve End User / L1 Support user IDs from identity-service - "
                    + "make sure identity-service is up (and has already run its own seeder) "
                    + "before asset-catalog-service starts. Affected assets were seeded unassigned.");
        }
    }

    private Long firstUserIdOrNull(String role) {
        List<Long> ids = userDirectoryClient.findUserIdsByRole(role);
        return ids.isEmpty() ? null : ids.get(0);
    }
}
