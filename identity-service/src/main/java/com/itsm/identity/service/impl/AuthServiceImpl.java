package com.itsm.identity.service.impl;

import com.itsm.identity.dto.request.LoginRequest;
import com.itsm.identity.dto.request.RegisterRequest;
import com.itsm.identity.dto.response.AuthResponse;
import com.itsm.identity.entity.User;
import com.itsm.identity.exception.BadRequestException;
import com.itsm.identity.repository.UserRepository;
import com.itsm.identity.security.JwtUtils;
import com.itsm.identity.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BadRequestException("Email already registered: " + req.email());
        }
        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(req.role())
                .phone(req.phone())
                .teamID(req.teamID())
                .locationID(req.locationID())
                .build();
        user = userRepository.save(user);
        String token = jwtUtils.generateToken(user);
        return new AuthResponse(token, user.getUserID(), user.getName(), user.getEmail(), user.getRole());
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User user = (User) auth.getPrincipal();
        String token = jwtUtils.generateToken(user);
        return new AuthResponse(token, user.getUserID(), user.getName(), user.getEmail(), user.getRole());
    }
}
