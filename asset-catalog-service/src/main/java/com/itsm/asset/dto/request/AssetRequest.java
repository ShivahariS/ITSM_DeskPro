package com.itsm.asset.dto.request;

import com.itsm.asset.enums.AssetStatus;
import com.itsm.asset.enums.AssetType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AssetRequest(
        @NotNull AssetType assetType,
        String make,
        String model,
        String serialNumber,
        Long assignedToID,
        String locationID,
        LocalDate purchaseDate,
        LocalDate warrantyExpiry,
        AssetStatus status
) {}
