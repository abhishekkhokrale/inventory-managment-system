package com.kitchen.inventory.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private List<RoleInfo> roles;
    private boolean active;
    private boolean verified;
    private boolean locked;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;

    @Data
    @Builder
    public static class RoleInfo {
        private UUID id;
        private String name;
    }
}
