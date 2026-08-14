package com.itsm.asset.dto.request;

import jakarta.validation.constraints.NotNull;

public record ServiceRequestRequest(
        @NotNull Long catalogItemID,
        String details
) {}
