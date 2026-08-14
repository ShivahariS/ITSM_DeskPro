package com.itsm.identity.controller;

import com.itsm.identity.entity.User;
import com.itsm.identity.enums.Role;
import com.itsm.identity.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Service-to-service only. Lets other microservices resolve which user IDs to notify
 * (e.g. "all L1 support staff") without owning a copy of the User table themselves.
 * Guarded by InternalApiKeyFilter, not by end-user JWTs.
 */
@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
@Tag(name = "Internal - User Directory", description = "Service-to-service user lookups")
public class InternalUserController {

    private final UserRepository userRepository;

    @GetMapping("/by-role/{role}")
    public List<Long> findUserIdsByRole(@PathVariable String role) {
        Role r = Role.valueOf(role.toUpperCase());
        return userRepository.findByRole(r).stream().map(User::getUserID).toList();
    }

    @GetMapping("/by-team/{teamId}")
    public List<Long> findUserIdsByTeam(@PathVariable Long teamId) {
        return userRepository.findByTeamID(teamId).stream().map(User::getUserID).toList();
    }
}
