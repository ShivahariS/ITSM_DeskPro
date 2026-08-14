package com.itsm.identity.service;

import com.itsm.identity.entity.User;
import com.itsm.identity.enums.Role;
import com.itsm.identity.enums.UserStatus;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(Long id);
    User updateUserStatus(Long id, UserStatus status);
    User updateUserRole(Long id, Role role);
    void deleteUser(Long id);
    List<User> getUsersByRole(Role role);
    void changePassword(Long userID, String oldPassword, String newPassword);
}
