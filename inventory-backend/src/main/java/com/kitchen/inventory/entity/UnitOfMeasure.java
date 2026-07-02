package com.kitchen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "units_of_measure")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitOfMeasure extends BaseEntity {

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "abbreviation", nullable = false, length = 10)
    private String abbreviation;

    @Column(name = "type", length = 20)
    private String type; // WEIGHT, VOLUME, COUNT, LENGTH

    @Column(name = "base_conversion_factor", precision = 15, scale = 8)
    private BigDecimal baseConversionFactor;

    @Column(name = "base_unit", length = 10)
    private String baseUnit;
}
