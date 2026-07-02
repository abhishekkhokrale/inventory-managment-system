package com.kitchen.inventory.dto.request;

import com.kitchen.inventory.enums.StorageType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class IngredientRequest {

    @NotBlank(message = "Ingredient name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Ingredient code is required")
    @Size(max = 30)
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Code must be uppercase alphanumeric with hyphens")
    private String code;

    private String description;

    @NotNull(message = "Category is required")
    private UUID categoryId;

    @NotNull(message = "Unit of measure is required")
    private UUID unitOfMeasureId;

    @Min(value = 1, message = "Shelf life must be positive")
    private Integer shelfLifeDays;

    @DecimalMin(value = "0.0", message = "Reorder level must be non-negative")
    private BigDecimal reorderLevel;

    @DecimalMin(value = "0.0")
    private BigDecimal minimumStock;

    @DecimalMin(value = "0.0")
    private BigDecimal maximumStock;

    @NotNull(message = "Storage type is required")
    private StorageType storageType;

    @DecimalMin(value = "0.0")
    private BigDecimal standardCost;

    private String barcode;
    private String allergens;
    private boolean perishable = true;
    private boolean trackBatch = true;
    private boolean trackExpiry = true;
}
