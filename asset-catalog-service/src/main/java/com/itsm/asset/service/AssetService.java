/*package com.itsm.asset.service;

import com.itsm.asset.dto.request.AssetRequest;
import com.itsm.asset.dto.request.ConfigItemRequest;
import com.itsm.asset.dto.request.LicenseRequest;
import com.itsm.asset.entity.AssetRecord;
import com.itsm.asset.entity.ConfigurationItem;
import com.itsm.asset.entity.SoftwareLicense;

import java.util.List;

public interface AssetService {
    AssetRecord createAsset(AssetRequest request);
    AssetRecord getAssetById(Long id);
    List<AssetRecord> getAllAssets();
    AssetRecord updateAsset(Long id, AssetRequest request);
    void deleteAsset(Long id);
    List<AssetRecord> getExpiringWarrantyAssets();

    SoftwareLicense createLicense(LicenseRequest request);
    SoftwareLicense getLicenseById(Long id);
    List<SoftwareLicense> getAllLicenses();
    SoftwareLicense updateLicense(Long id, LicenseRequest request);
    List<SoftwareLicense> getExpiringLicenses();

    ConfigurationItem createCI(ConfigItemRequest request);
    ConfigurationItem getCIById(Long id);
    List<ConfigurationItem> getAllCIs();
    ConfigurationItem updateCI(Long id, ConfigItemRequest request);
}
*/

package com.itsm.asset.service;

import com.itsm.asset.dto.request.AssetRequest;
import com.itsm.asset.dto.request.ConfigItemRequest;
import com.itsm.asset.dto.request.LicenseRequest;
import com.itsm.asset.entity.AssetRecord;
import com.itsm.asset.entity.ConfigurationItem;
import com.itsm.asset.entity.SoftwareLicense;

import java.util.List;

public interface AssetService {
    AssetRecord createAsset(AssetRequest request);
    AssetRecord getAssetById(Long id);
    List<AssetRecord> getAllAssets();
    AssetRecord updateAsset(Long id, AssetRequest request);
    void deleteAsset(Long id);
    List<AssetRecord> getExpiringWarrantyAssets();

    SoftwareLicense createLicense(LicenseRequest request);
    SoftwareLicense getLicenseById(Long id);
    List<SoftwareLicense> getAllLicenses();
    SoftwareLicense updateLicense(Long id, LicenseRequest request);
    List<SoftwareLicense> getExpiringLicenses();

    ConfigurationItem createCI(ConfigItemRequest request);
    ConfigurationItem getCIById(Long id);
    List<ConfigurationItem> getAllCIs();
    ConfigurationItem updateCI(Long id, ConfigItemRequest request);

    // --- Asset Request Fulfillment Extensions ---
    AssetRecord fulfillHardwareRequest(Long requestId, Long assetId, Long userId);
    SoftwareLicense fulfillSoftwareRequest(Long requestId, Long licenseId);
}