package com.kitchen.inventory.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class KitchenRequest {

    @NotBlank(message = "Kitchen name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Kitchen code is required")
    @Size(max = 20)
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Code must be uppercase alphanumeric with hyphens")
    private String code;

    private String location;

    @Email(message = "Invalid email format")
    private String contactEmail;

    private String contactPhone;
    private String description;
}
