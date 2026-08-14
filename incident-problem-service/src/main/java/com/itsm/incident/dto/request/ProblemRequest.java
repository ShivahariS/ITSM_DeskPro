package com.itsm.incident.dto.request;

import com.itsm.incident.enums.ProblemPriority;
import jakarta.validation.constraints.NotBlank;

public record ProblemRequest(
        @NotBlank String title,
        String description,
        String linkedIncidentIDs,
        ProblemPriority priority,
        Long assignedToID
) {}
