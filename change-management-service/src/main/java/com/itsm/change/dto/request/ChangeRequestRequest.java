package com.itsm.change.dto.request;

import com.itsm.change.enums.ChangeType;
import com.itsm.change.enums.RiskLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record ChangeRequestRequest(
        @NotBlank String title,
        String description,
        @NotNull ChangeType changeType,
        String impactAssessment,
        RiskLevel riskLevel,
        String rollbackPlan,
        LocalDateTime plannedStartDate,
        LocalDateTime plannedEndDate
) {}
