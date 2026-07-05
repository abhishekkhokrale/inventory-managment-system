package com.kitchen.inventory.dto.request;

import com.kitchen.inventory.enums.StorageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class WarehouseRequest {

    @NotBlank(message = "Warehouse name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Warehouse code is required")
    @Size(max = 20)
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Code must be uppercase alphanumeric with hyphens")
    private String code;

    @NotNull(message = "Storage type is required")
    private StorageType storageType;

    private String location;
    private BigDecimal capacity;
    private String capacityUnit;
    private BigDecimal temperatureMin;
    private BigDecimal temperatureMax;

    @NotNull(message = "Kitchen is required")
    private UUID kitchenId;
}
