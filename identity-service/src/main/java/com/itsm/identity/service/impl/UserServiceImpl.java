package com.itsm.identity.service.impl;

import com.itsm.identity.entity.User;
import com.itsm.identity.enums.Role;
import com.itsm.identity.enums.UserStatus;
import com.itsm.identity.exception.BadRequestException;
import com.itsm.identity.exception.ResourceNotFoundException;
import com.itsm.identity.repository.UserRepository;
import com.itsm.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Override
    public User updateUserStatus(Long id, UserStatus status) {
        User user = getUserById(id);
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Override
    public User updateUserRole(Long id, Role role) {
        User user = getUserById(id);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    @Override
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    @Override
    public void changePassword(Long userID, String oldPassword, String newPassword) {
        User user = getUserById(userID);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Incorrect old password.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
