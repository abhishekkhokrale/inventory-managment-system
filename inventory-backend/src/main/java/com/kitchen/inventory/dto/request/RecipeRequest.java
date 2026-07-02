package com.kitchen.inventory.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RecipeRequest {

    @NotBlank(message = "Recipe name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Recipe code is required")
    @Size(max = 30)
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Code must be uppercase alphanumeric with hyphens")
    private String code;

    private String description;

    @NotNull(message = "Yield quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Yield quantity must be greater than 0")
    private BigDecimal yieldQuantity;

    private String yieldUnit;

    private BigDecimal servingSize;

    private Integer preparationTimeMinutes;

    private Integer cookingTimeMinutes;

    private String instructions;

    private boolean published = false;

    @NotEmpty(message = "Add at least one ingredient")
    @Valid
    private List<RecipeIngredientRequest> ingredients;
}
