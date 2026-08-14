package com.itsm.identity.dto.response;

import com.itsm.identity.enums.Role;

public record AuthResponse(
        String token,
        String tokenType,
        Long userID,
        String name,
        String email,
        Role role
) {
    public AuthResponse(String token, Long userID, String name, String email, Role role) {
        this(token, "Bearer", userID, name, email, role);
    }
}
