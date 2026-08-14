package com.itsm.identity.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
    @NotBlank String oldPassword,
    @NotBlank String newPassword
) {}
