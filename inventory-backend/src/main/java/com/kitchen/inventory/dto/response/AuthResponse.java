package com.kitchen.inventory.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UUID userId;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;
    private Set<String> permissions;
}
