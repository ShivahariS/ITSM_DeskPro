package com.itsm.incident.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SatisfactionRequest(
        @NotNull @Min(1) @Max(5) Integer rating,
        String feedback
) {}
