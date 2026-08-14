package com.itsm.incident.dto.request;

import com.itsm.incident.enums.NoteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IncidentNoteRequest(
        @NotBlank String noteText,
        @NotNull NoteType noteType
) {}
