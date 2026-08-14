package com.itsm.asset.dto.request;

import com.itsm.asset.enums.CatalogCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CatalogItemRequest(
        @NotBlank String serviceName,
        @NotNull CatalogCategory category,
        String description,
        Integer fulfilmentSLAHours,
        Boolean approvalRequired,
        Long deliveryTeamID
) {}
