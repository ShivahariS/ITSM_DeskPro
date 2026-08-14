package com.itsm.change.dto.request;

import com.itsm.change.enums.ImplementationOutcome;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record ImplementationRequest(
        LocalDateTime actualStartDate,
        LocalDateTime actualEndDate,
        @NotNull ImplementationOutcome outcome,
        String pirComments
) {}
