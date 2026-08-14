package com.itsm.incident.dto.request;

import jakarta.validation.constraints.NotNull;

public record EscalateRequest(
        @NotNull Long assignedToID,
        Long assignedTeamID,
        String reason
) {}
