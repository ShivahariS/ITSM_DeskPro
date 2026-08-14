package com.itsm.asset.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssetFulfillmentRequest(
        @NotNull(message = "Request ID is required")
        Long requestId,

        Long selectedAssetId,   // ID of hardware asset if assigning hardware
        Long selectedLicenseId, // ID of software license if assigning software

        @NotNull(message = "Target User ID is required")
        Long targetUserId,      // End-user receiving the asset/license

        String comments
) {}