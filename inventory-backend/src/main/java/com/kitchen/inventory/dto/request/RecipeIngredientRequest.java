package com.kitchen.inventory.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class RecipeIngredientRequest {

    @NotNull(message = "Ingredient is required")
    private UUID ingredientId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    @DecimalMin(value = "0.0", message = "Waste percentage must be non-negative")
    private BigDecimal wastePercentage;

    private boolean optional = false;

    private String notes;
}
