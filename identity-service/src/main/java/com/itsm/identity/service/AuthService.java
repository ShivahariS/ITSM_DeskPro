package com.itsm.identity.service;

import com.itsm.identity.dto.request.LoginRequest;
import com.itsm.identity.dto.request.RegisterRequest;
import com.itsm.identity.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
