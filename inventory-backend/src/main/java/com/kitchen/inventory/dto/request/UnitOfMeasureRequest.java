package com.kitchen.inventory.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UnitOfMeasureRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 50)
    private String name;

    @NotBlank(message = "Abbreviation is required")
    @Size(max = 10)
    private String abbreviation;

    @NotBlank(message = "Type is required")
    private String type;

    @DecimalMin(value = "0.0", inclusive = false, message = "Base conversion factor must be greater than 0")
    private BigDecimal baseConversionFactor;

    @NotBlank(message = "Base unit is required")
    private String baseUnit;
}
