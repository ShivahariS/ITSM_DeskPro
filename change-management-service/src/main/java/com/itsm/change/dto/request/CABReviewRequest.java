package com.itsm.change.dto.request;

import com.itsm.change.enums.CABDecision;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CABReviewRequest(
        LocalDateTime reviewDate,
        String attendeeIDs,
        @NotNull CABDecision decision,
        String comments
) {}
