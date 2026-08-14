package com.itsm.incident.dto.request;

import com.itsm.incident.enums.IncidentCategory;
import com.itsm.incident.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IncidentRequest(
        @NotBlank String description,
        @NotNull IncidentCategory category,
        Priority priority
) {}
