package com.kitchen.inventory.entity;

import com.kitchen.inventory.enums.StorageType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false)
    private StorageType storageType;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "capacity", precision = 12, scale = 3)
    private BigDecimal capacity;

    @Column(name = "capacity_unit", length = 20)
    private String capacityUnit;

    @Column(name = "temperature_min", precision = 6, scale = 2)
    private BigDecimal temperatureMin;

    @Column(name = "temperature_max", precision = 6, scale = 2)
    private BigDecimal temperatureMax;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;
}
