package com.itsm.identity.dto.request;

import com.itsm.identity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotNull Role role,
        String phone,
        Long teamID,
        String locationID
) {}
