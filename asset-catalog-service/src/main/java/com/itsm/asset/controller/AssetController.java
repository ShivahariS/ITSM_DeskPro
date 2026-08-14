package com.itsm.asset.controller;

import com.itsm.asset.dto.request.AssetRequest;
import com.itsm.asset.dto.request.ConfigItemRequest;
import com.itsm.asset.dto.request.LicenseRequest;
import com.itsm.asset.entity.AssetRecord;
import com.itsm.asset.entity.ConfigurationItem;
import com.itsm.asset.entity.SoftwareLicense;
import com.itsm.asset.service.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Asset & CMDB Management", description = "Hardware assets, software licenses, and configuration items")
@PreAuthorize("hasAnyRole('ASSET_MANAGER','ADMIN')")
public class AssetController {

    private final AssetService assetService;

    @PostMapping("/assets")
    @Operation(summary = "Create asset record")
    public ResponseEntity<AssetRecord> createAsset(@Valid @RequestBody AssetRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createAsset(req));
    }

    @GetMapping("/assets")
    @Operation(summary = "Get all assets")
    public ResponseEntity<List<AssetRecord>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @GetMapping("/assets/{id}")
    @Operation(summary = "Get asset by ID")
    public ResponseEntity<AssetRecord> getAsset(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    @PutMapping("/assets/{id}")
    @Operation(summary = "Update asset")
    public ResponseEntity<AssetRecord> updateAsset(@PathVariable Long id, @Valid @RequestBody AssetRequest req) {
        return ResponseEntity.ok(assetService.updateAsset(id, req));
    }

    @DeleteMapping("/assets/{id}")
    @Operation(summary = "Delete asset")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assets/expiring-warranty")
    @Operation(summary = "Get assets with warranty expiring in 30 days")
    public ResponseEntity<List<AssetRecord>> getExpiringWarranty() {
        return ResponseEntity.ok(assetService.getExpiringWarrantyAssets());
    }


    @PostMapping("/licenses")
    @Operation(summary = "Create software license")
    public ResponseEntity<SoftwareLicense> createLicense(@Valid @RequestBody LicenseRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createLicense(req));
    }

    @GetMapping("/licenses")
    @Operation(summary = "Get all licenses")
    public ResponseEntity<List<SoftwareLicense>> getAllLicenses() {
        return ResponseEntity.ok(assetService.getAllLicenses());
    }

    @GetMapping("/licenses/{id}")
    @Operation(summary = "Get license by ID")
    public ResponseEntity<SoftwareLicense> getLicense(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getLicenseById(id));
    }

    @PutMapping("/licenses/{id}")
    @Operation(summary = "Update license")
    public ResponseEntity<SoftwareLicense> updateLicense(@PathVariable Long id,
                                                         @Valid @RequestBody LicenseRequest req) {
        return ResponseEntity.ok(assetService.updateLicense(id, req));
    }

    @GetMapping("/licenses/expiring")
    @Operation(summary = "Get licenses expiring in 30 days")
    public ResponseEntity<List<SoftwareLicense>> getExpiringLicenses() {
        return ResponseEntity.ok(assetService.getExpiringLicenses());
    }


    @PostMapping("/config-items")
    @Operation(summary = "Create configuration item")
    public ResponseEntity<ConfigurationItem> createCI(@Valid @RequestBody ConfigItemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assetService.createCI(req));
    }

    // Read access to CIs is broadened to L2/L3 support so their CMDB inspection
    // and CI-linking workspaces can function. Create/update remain ASSET_MANAGER/ADMIN.
    @GetMapping("/config-items")
    @Operation(summary = "Get all configuration items")
    @PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','ASSET_MANAGER','ADMIN')")
    public ResponseEntity<List<ConfigurationItem>> getAllCIs() {
        return ResponseEntity.ok(assetService.getAllCIs());
    }

    @GetMapping("/config-items/{id}")
    @Operation(summary = "Get CI by ID")
    @PreAuthorize("hasAnyRole('L2_SUPPORT','L3_SUPPORT','ASSET_MANAGER','ADMIN')")
    public ResponseEntity<ConfigurationItem> getCI(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getCIById(id));
    }

    @PutMapping("/config-items/{id}")
    @Operation(summary = "Update configuration item")
    public ResponseEntity<ConfigurationItem> updateCI(@PathVariable Long id,
                                                      @Valid @RequestBody ConfigItemRequest req) {
        return ResponseEntity.ok(assetService.updateCI(id, req));
    }

    // --- REQUEST FULFILLMENT ENDPOINTS ---

    @PostMapping("/assets/fulfill-hardware")
    @Operation(summary = "Approve hardware request and assign asset")
    public ResponseEntity<AssetRecord> fulfillHardwareRequest(
            @RequestParam Long requestId,
            @RequestParam Long assetId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(assetService.fulfillHardwareRequest(requestId, assetId, userId));
    }

    @PostMapping("/licenses/fulfill-software")
    @Operation(summary = "Approve software request and assign license seat")
    public ResponseEntity<SoftwareLicense> fulfillSoftwareRequest(
            @RequestParam Long requestId,
            @RequestParam Long licenseId) {
        return ResponseEntity.ok(assetService.fulfillSoftwareRequest(requestId, licenseId));
    }
}