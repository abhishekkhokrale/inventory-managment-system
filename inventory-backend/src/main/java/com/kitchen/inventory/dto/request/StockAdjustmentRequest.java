package com.kitchen.inventory.dto.request;

import com.kitchen.inventory.enums.StockTransactionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class StockAdjustmentRequest {

    @NotNull(message = "Ingredient is required")
    private UUID ingredientId;

    @NotNull(message = "Warehouse is required")
    private UUID warehouseId;

    @NotNull(message = "Transaction type is required")
    private StockTransactionType transactionType;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "Unit of measure is required")
    private UUID unitOfMeasureId;

    private String batchNumber;
    private LocalDate expiryDate;

    @DecimalMin(value = "0.0")
    private BigDecimal unitCost;

    @NotBlank(message = "Reason is required for adjustment")
    private String remarks;
}
