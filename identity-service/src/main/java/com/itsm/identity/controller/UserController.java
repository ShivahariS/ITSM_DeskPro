package com.itsm.identity.controller;

import com.itsm.identity.entity.User;
import com.itsm.identity.enums.Role;
import com.itsm.identity.enums.UserStatus;
import com.itsm.identity.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Admin user management operations")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users [ADMIN]")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'L1_SUPPORT', 'L2_SUPPORT', 'L3_SUPPORT', 'END_USER', 'ASSET_MANAGER','CHANGE_MANAGER')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/by-role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get users by role [ADMIN]")
    public ResponseEntity<List<User>> getUsersByRole(@RequestParam Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status [ADMIN]")
    public ResponseEntity<User> updateStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        return ResponseEntity.ok(userService.updateUserStatus(id, status));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role [ADMIN]")
    public ResponseEntity<User> updateRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user [ADMIN]")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change current user password")
    public ResponseEntity<Void> changePassword(@RequestBody com.itsm.identity.dto.request.ChangePasswordRequest req) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            User user = (User) auth.getPrincipal();
            userService.changePassword(user.getUserID(), req.oldPassword(), req.newPassword());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
    }
}
