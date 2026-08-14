package com.itsm.asset.dto.request;

import com.itsm.asset.enums.LicenseStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record LicenseRequest(
        @NotBlank String softwareName,
        String vendor,
        LocalDate expiryDate,
        LicenseStatus status,
        Long assignedToID
) {}
