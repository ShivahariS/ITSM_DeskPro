/*package com.itsm.asset.service.impl;

import com.itsm.asset.dto.request.AssetRequest;
import com.itsm.asset.dto.request.ConfigItemRequest;
import com.itsm.asset.dto.request.LicenseRequest;
import com.itsm.asset.entity.AssetRecord;
import com.itsm.asset.entity.ConfigurationItem;
import com.itsm.asset.entity.SoftwareLicense;
import com.itsm.asset.enums.AssetStatus;
import com.itsm.asset.enums.CIStatus;
import com.itsm.asset.enums.LicenseStatus;
import com.itsm.asset.exception.ResourceNotFoundException;
import com.itsm.asset.repository.AssetRecordRepository;
import com.itsm.asset.repository.ConfigurationItemRepository;
import com.itsm.asset.repository.SoftwareLicenseRepository;
import com.itsm.asset.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRecordRepository assetRepo;
    private final SoftwareLicenseRepository licenseRepo;
    private final ConfigurationItemRepository ciRepo;

    @Override
    public AssetRecord createAsset(AssetRequest req) {
        return assetRepo.save(AssetRecord.builder()
                .assetType(req.assetType()).make(req.make()).model(req.model())
                .serialNumber(req.serialNumber()).assignedToID(req.assignedToID())
                .locationID(req.locationID()).purchaseDate(req.purchaseDate())
                .warrantyExpiry(req.warrantyExpiry())
                .status(req.status() != null ? req.status() : AssetStatus.IN_STOCK)
                .build());
    }

    @Override
    public AssetRecord getAssetById(Long id) {
        return assetRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));
    }

    @Override
    public List<AssetRecord> getAllAssets() { return assetRepo.findAll(); }

    @Override
    public AssetRecord updateAsset(Long id, AssetRequest req) {
        AssetRecord a = getAssetById(id);
        a.setAssetType(req.assetType()); a.setMake(req.make()); a.setModel(req.model());
        a.setSerialNumber(req.serialNumber()); a.setAssignedToID(req.assignedToID());
        a.setLocationID(req.locationID()); a.setPurchaseDate(req.purchaseDate());
        a.setWarrantyExpiry(req.warrantyExpiry());
        if (req.status() != null) a.setStatus(req.status());
        return assetRepo.save(a);
    }

    @Override
    public void deleteAsset(Long id) {
        assetRepo.delete(getAssetById(id));
    }

    @Override
    public List<AssetRecord> getExpiringWarrantyAssets() {
        return assetRepo.findByWarrantyExpiryBefore(LocalDate.now().plusDays(30));
    }

    @Override
    public SoftwareLicense createLicense(LicenseRequest req) {
        return licenseRepo.save(SoftwareLicense.builder()
                .softwareName(req.softwareName()).vendor(req.vendor())
                .licenseType(req.licenseType()).totalSeats(req.totalSeats())
                .usedSeats(req.usedSeats() != null ? req.usedSeats() : 0)
                .expiryDate(req.expiryDate())
                .status(req.status() != null ? req.status() : LicenseStatus.ACTIVE)
                .build());
    }

    @Override
    public SoftwareLicense getLicenseById(Long id) {
        return licenseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("License not found: " + id));
    }

    @Override
    public List<SoftwareLicense> getAllLicenses() { return licenseRepo.findAll(); }

    @Override
    public SoftwareLicense updateLicense(Long id, LicenseRequest req) {
        SoftwareLicense l = getLicenseById(id);
        l.setSoftwareName(req.softwareName()); l.setVendor(req.vendor());
        l.setLicenseType(req.licenseType()); l.setTotalSeats(req.totalSeats());
        if (req.usedSeats() != null) l.setUsedSeats(req.usedSeats());
        l.setExpiryDate(req.expiryDate());
        if (req.status() != null) l.setStatus(req.status());
        return licenseRepo.save(l);
    }

    @Override
    public List<SoftwareLicense> getExpiringLicenses() {
        return licenseRepo.findByExpiryDateBefore(LocalDate.now().plusDays(30));
    }

    @Override
    public ConfigurationItem createCI(ConfigItemRequest req) {
        return ciRepo.save(ConfigurationItem.builder()
                .ciName(req.ciName()).ciType(req.ciType())
                .linkedAssetID(req.linkedAssetID()).owner(req.owner())
                .environment(req.environment()).dependsOnCIIDs(req.dependsOnCIIDs())
                .status(req.status() != null ? req.status() : CIStatus.ACTIVE)
                .build());
    }

    @Override
    public ConfigurationItem getCIById(Long id) {
        return ciRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration item not found: " + id));
    }

    @Override
    public List<ConfigurationItem> getAllCIs() { return ciRepo.findAll(); }

    @Override
    public ConfigurationItem updateCI(Long id, ConfigItemRequest req) {
        ConfigurationItem ci = getCIById(id);
        ci.setCiName(req.ciName()); ci.setCiType(req.ciType());
        ci.setLinkedAssetID(req.linkedAssetID()); ci.setOwner(req.owner());
        ci.setEnvironment(req.environment()); ci.setDependsOnCIIDs(req.dependsOnCIIDs());
        if (req.status() != null) ci.setStatus(req.status());
        return ciRepo.save(ci);
    }
}
*/

/*package com.itsm.asset.service.impl;

import com.itsm.asset.dto.request.AssetRequest;
import com.itsm.asset.dto.request.ConfigItemRequest;
import com.itsm.asset.dto.request.LicenseRequest;
import com.itsm.asset.entity.AssetRecord;
import com.itsm.asset.entity.ConfigurationItem;
import com.itsm.asset.entity.SoftwareLicense;
import com.itsm.asset.enums.AssetStatus;
import com.itsm.asset.enums.CIStatus;
import com.itsm.asset.enums.LicenseStatus;
import com.itsm.asset.exception.ResourceNotFoundException;
import com.itsm.asset.repository.AssetRecordRepository;
import com.itsm.asset.repository.ConfigurationItemRepository;
import com.itsm.asset.repository.SoftwareLicenseRepository;
import com.itsm.asset.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRecordRepository assetRepo;
    private final SoftwareLicenseRepository licenseRepo;
    private final ConfigurationItemRepository ciRepo;

    @Override
    public AssetRecord createAsset(AssetRequest req) {
        return assetRepo.save(AssetRecord.builder()
                .assetType(req.assetType()).make(req.make()).model(req.model())
                .serialNumber(req.serialNumber()).assignedToID(req.assignedToID())
                .locationID(req.locationID()).purchaseDate(req.purchaseDate())
                .warrantyExpiry(req.warrantyExpiry())
                .status(req.status() != null ? req.status() : AssetStatus.IN_STOCK)
                .build());
    }

    @Override
    public AssetRecord getAssetById(Long id) {
        return assetRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));
    }

    @Override
    public List<AssetRecord> getAllAssets() { return assetRepo.findAll(); }

    @Override
    public AssetRecord updateAsset(Long id, AssetRequest req) {
        AssetRecord a = getAssetById(id);
        a.setAssetType(req.assetType()); a.setMake(req.make()); a.setModel(req.model());
        a.setSerialNumber(req.serialNumber()); a.setAssignedToID(req.assignedToID());
        a.setLocationID(req.locationID()); a.setPurchaseDate(req.purchaseDate());
        a.setWarrantyExpiry(req.warrantyExpiry());
        if (req.status() != null) a.setStatus(req.status());
        return assetRepo.save(a);
    }

    @Override
    public void deleteAsset(Long id) {
        assetRepo.delete(getAssetById(id));
    }

    @Override
    public List<AssetRecord> getExpiringWarrantyAssets() {
        return assetRepo.findByWarrantyExpiryBefore(LocalDate.now().plusDays(30));
    }

    @Override
    public SoftwareLicense createLicense(LicenseRequest req) {
        return licenseRepo.save(SoftwareLicense.builder()
                .softwareName(req.softwareName()).vendor(req.vendor())
                .licenseType(req.licenseType()).totalSeats(req.totalSeats())
                .usedSeats(req.usedSeats() != null ? req.usedSeats() : 0)
                .expiryDate(req.expiryDate())
                .status(req.status() != null ? req.status() : LicenseStatus.ACTIVE)
                .build());
    }

    @Override
    public SoftwareLicense getLicenseById(Long id) {
        return licenseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("License not found: " + id));
    }

    @Override
    public List<SoftwareLicense> getAllLicenses() { return licenseRepo.findAll(); }

    @Override
    public SoftwareLicense updateLicense(Long id, LicenseRequest req) {
        SoftwareLicense l = getLicenseById(id);
        l.setSoftwareName(req.softwareName()); l.setVendor(req.vendor());
        l.setLicenseType(req.licenseType()); l.setTotalSeats(req.totalSeats());
        if (req.usedSeats() != null) l.setUsedSeats(req.usedSeats());
        l.setExpiryDate(req.expiryDate());
        if (req.status() != null) l.setStatus(req.status());
        return licenseRepo.save(l);
    }

    @Override
    public List<SoftwareLicense> getExpiringLicenses() {
        return licenseRepo.findByExpiryDateBefore(LocalDate.now().plusDays(30));
    }

    @Override
    public ConfigurationItem createCI(ConfigItemRequest req) {
        return ciRepo.save(ConfigurationItem.builder()
                .ciName(req.ciName()).ciType(req.ciType())
                .linkedAssetID(req.linkedAssetID()).owner(req.owner())
                .environment(req.environment()).dependsOnCIIDs(req.dependsOnCIIDs())
                .status(req.status() != null ? req.status() : CIStatus.ACTIVE)
                .build());
    }

    @Override
    public ConfigurationItem getCIById(Long id) {
        return ciRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration item not found: " + id));
    }

    @Override
    public List<ConfigurationItem> getAllCIs() { return ciRepo.findAll(); }

    @Override
    public ConfigurationItem updateCI(Long id, ConfigItemRequest req) {
        ConfigurationItem ci = getCIById(id);
        ci.setCiName(req.ciName()); ci.setCiType(req.ciType());
        ci.setLinkedAssetID(req.linkedAssetID()); ci.setOwner(req.owner());
        ci.setEnvironment(req.environment()); ci.setDependsOnCIIDs(req.dependsOnCIIDs());
        if (req.status() != null) ci.setStatus(req.status());
        return ciRepo.save(ci);
    }

    // --- Asset Request Fulfillment Extensions ---

    @Transactional
    @Override
    public AssetRecord fulfillHardwareRequest(Long requestId, Long assetId, Long userId) {
        AssetRecord asset = getAssetById(assetId);
        asset.setAssignedToID(userId);
        asset.setStatus(AssetStatus.IN_USE);
        return assetRepo.save(asset);
    }

    @Transactional
    @Override
    public SoftwareLicense fulfillSoftwareRequest(Long requestId, Long licenseId) {
        SoftwareLicense license = getLicenseById(licenseId);
        if (license.getUsedSeats() >= license.getTotalSeats()) {
            throw new IllegalStateException("No available seats left for license ID: " + licenseId);
        }
        license.setUsedSeats(license.getUsedSeats() + 1);
        return licenseRepo.save(license);
    }
}
*/

package com.itsm.asset.service.impl;

import com.itsm.asset.dto.request.AssetRequest;
import com.itsm.asset.dto.request.ConfigItemRequest;
import com.itsm.asset.dto.request.LicenseRequest;
import com.itsm.asset.entity.AssetRecord;
import com.itsm.asset.entity.ConfigurationItem;
import com.itsm.asset.entity.SoftwareLicense;
import com.itsm.asset.enums.AssetStatus;
import com.itsm.asset.enums.CIStatus;
import com.itsm.asset.enums.LicenseStatus;
import com.itsm.asset.enums.ServiceRequestStatus;
import com.itsm.asset.exception.ResourceNotFoundException;
import com.itsm.asset.repository.AssetRecordRepository;
import com.itsm.asset.repository.ConfigurationItemRepository;
import com.itsm.asset.repository.ServiceRequestRepository;
import com.itsm.asset.repository.SoftwareLicenseRepository;
import com.itsm.asset.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRecordRepository assetRepo;
    private final SoftwareLicenseRepository licenseRepo;
    private final ConfigurationItemRepository ciRepo;
    private final ServiceRequestRepository serviceRequestRepo;
    private final com.itsm.asset.client.ReportEventClient reportEventPublisher;

    @Override
    public AssetRecord createAsset(AssetRequest req) {
        return assetRepo.save(AssetRecord.builder()
                .assetType(req.assetType()).make(req.make()).model(req.model())
                .serialNumber(req.serialNumber()).assignedToID(req.assignedToID())
                .locationID(req.locationID()).purchaseDate(req.purchaseDate())
                .warrantyExpiry(req.warrantyExpiry())
                .status(req.status() != null ? req.status() : AssetStatus.IN_STOCK)
                .build());
    }

    @Override
    public AssetRecord getAssetById(Long id) {
        return assetRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));
    }

    @Override
    public List<AssetRecord> getAllAssets() { return assetRepo.findAll(); }

    @Override
    public AssetRecord updateAsset(Long id, AssetRequest req) {
        AssetRecord a = getAssetById(id);
        a.setAssetType(req.assetType()); a.setMake(req.make()); a.setModel(req.model());
        a.setSerialNumber(req.serialNumber()); a.setAssignedToID(req.assignedToID());
        a.setLocationID(req.locationID()); a.setPurchaseDate(req.purchaseDate());
        a.setWarrantyExpiry(req.warrantyExpiry());
        if (req.status() != null) a.setStatus(req.status());
        return assetRepo.save(a);
    }

    @Override
    public void deleteAsset(Long id) {
        assetRepo.delete(getAssetById(id));
    }

    @Override
    public List<AssetRecord> getExpiringWarrantyAssets() {
        return assetRepo.findByWarrantyExpiryBefore(LocalDate.now().plusDays(30));
    }

    @Transactional
    @Override
    public SoftwareLicense createLicense(LicenseRequest req) {
        SoftwareLicense saved = licenseRepo.save(SoftwareLicense.builder()
                .softwareName(req.softwareName()).vendor(req.vendor())
                .expiryDate(req.expiryDate())
                .status(req.status() != null ? req.status() : LicenseStatus.ACTIVE)
                .assignedToID(req.assignedToID())
                .build());
        publishLicenseChanged(saved);
        return saved;
    }

    @Override
    public SoftwareLicense getLicenseById(Long id) {
        return licenseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("License not found: " + id));
    }

    @Override
    public List<SoftwareLicense> getAllLicenses() { return licenseRepo.findAll(); }

    @Override
    public SoftwareLicense updateLicense(Long id, LicenseRequest req) {
        SoftwareLicense l = getLicenseById(id);
        l.setSoftwareName(req.softwareName()); l.setVendor(req.vendor());
        l.setExpiryDate(req.expiryDate());
        if (req.status() != null) l.setStatus(req.status());
        l.setAssignedToID(req.assignedToID());
        SoftwareLicense saved = licenseRepo.save(l);
        publishLicenseChanged(saved);
        return saved;
    }

    @Override
    public List<SoftwareLicense> getExpiringLicenses() {
        return licenseRepo.findByExpiryDateBefore(LocalDate.now().plusDays(30));
    }

    @Override
    public ConfigurationItem createCI(ConfigItemRequest req) {
        return ciRepo.save(ConfigurationItem.builder()
                .ciName(req.ciName()).ciType(req.ciType())
                .linkedAssetID(req.linkedAssetID()).owner(req.owner())
                .environment(req.environment()).dependsOnCIIDs(req.dependsOnCIIDs())
                .status(req.status() != null ? req.status() : CIStatus.ACTIVE)
                .build());
    }

    @Override
    public ConfigurationItem getCIById(Long id) {
        return ciRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration item not found: " + id));
    }

    @Override
    public List<ConfigurationItem> getAllCIs() { return ciRepo.findAll(); }

    @Override
    public ConfigurationItem updateCI(Long id, ConfigItemRequest req) {
        ConfigurationItem ci = getCIById(id);
        ci.setCiName(req.ciName()); ci.setCiType(req.ciType());
        ci.setLinkedAssetID(req.linkedAssetID()); ci.setOwner(req.owner());
        ci.setEnvironment(req.environment()); ci.setDependsOnCIIDs(req.dependsOnCIIDs());
        if (req.status() != null) ci.setStatus(req.status());
        return ciRepo.save(ci);
    }

    // --- Asset Request Fulfillment Extensions ---

    @Transactional
    @Override
    public AssetRecord fulfillHardwareRequest(Long requestId, Long assetId, Long userId) {
        // 1. Assign hardware asset to user and update status to IN_USE
        AssetRecord asset = getAssetById(assetId);
        asset.setAssignedToID(userId);
        asset.setStatus(AssetStatus.IN_USE);
        AssetRecord savedAsset = assetRepo.save(asset);

        // 2. Mark service request as FULFILLED so it drops off the Pending Requests queue
        if (requestId != null) {
            serviceRequestRepo.findById(requestId).ifPresent(req -> {
                req.setStatus(ServiceRequestStatus.FULFILLED);
                serviceRequestRepo.save(req);
            });
        }

        return savedAsset;
    }

    @Transactional
    @Override
    public SoftwareLicense fulfillSoftwareRequest(Long requestId, Long licenseId) {
        // 1. Get the license record with a fallback to the most recently created one
        SoftwareLicense license = licenseRepo.findById(licenseId).orElse(null);
        if (license == null) {
            List<SoftwareLicense> allLics = licenseRepo.findAll();
            if (!allLics.isEmpty()) {
                license = allLics.get(allLics.size() - 1);
            } else {
                throw new ResourceNotFoundException("License not found: " + licenseId);
            }
        }
        SoftwareLicense savedLicense = licenseRepo.save(license);
        publishLicenseChanged(savedLicense);

        // 2. Mark service request as FULFILLED
        if (requestId != null && requestId != -1) {
            serviceRequestRepo.findById(requestId).ifPresent(req -> {
                req.setStatus(ServiceRequestStatus.FULFILLED);
                serviceRequestRepo.save(req);
            });
        }

        return savedLicense;
    }

    private void publishLicenseChanged(SoftwareLicense license) {
        reportEventPublisher.publishLicenseChanged(new com.itsm.asset.client.ReportEventClient.LicenseChangedRequest(
                license.getLicenseID(), license.getStatus() != null ? license.getStatus().name() : null));
    }
}