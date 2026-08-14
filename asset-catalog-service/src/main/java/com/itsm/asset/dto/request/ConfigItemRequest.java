package com.itsm.asset.dto.request;

import com.itsm.asset.enums.CIStatus;
import com.itsm.asset.enums.Environment;
import jakarta.validation.constraints.NotBlank;

public record ConfigItemRequest(
        @NotBlank String ciName,
        String ciType,
        Long linkedAssetID,
        String owner,
        Environment environment,
        String dependsOnCIIDs,
        CIStatus status
) {}
