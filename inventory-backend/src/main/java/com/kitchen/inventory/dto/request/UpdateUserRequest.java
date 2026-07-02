package com.kitchen.inventory.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50)
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username can only contain letters, digits, dots, hyphens, and underscores")
    private String username;

    @Pattern(regexp = "^([+]?[0-9]{10,15})?$", message = "Invalid phone number")
    private String phone;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotEmpty(message = "At least one role is required")
    private Set<String> roles;

    private Boolean active;
}
