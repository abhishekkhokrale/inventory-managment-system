package com.kitchen.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Category code is required")
    @Size(max = 20)
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Code must be uppercase alphanumeric with hyphens")
    private String code;

    private String description;

    private UUID parentId;
}
