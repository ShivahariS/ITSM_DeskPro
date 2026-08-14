package com.itsm.incident.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record KnownErrorRequest(
        @NotNull Long problemID,
        @NotBlank String description,
        String workaround,
        LocalDate permanentFixETA
) {}
