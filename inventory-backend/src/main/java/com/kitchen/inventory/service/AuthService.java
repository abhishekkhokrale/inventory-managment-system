package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.request.LoginRequest;
import com.kitchen.inventory.dto.request.RegisterUserRequest;
import com.kitchen.inventory.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void logout(String userId);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
    void changePassword(String userId, String currentPassword, String newPassword);
    AuthResponse register(RegisterUserRequest request);
}
