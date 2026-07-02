package com.kitchen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "stock_items", indexes = {
    @Index(name = "idx_stock_ingredient_warehouse", columnList = "ingredient_id,warehouse_id"),
    @Index(name = "idx_stock_batch", columnList = "batch_number"),
    @Index(name = "idx_stock_expiry", columnList = "expiry_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(name = "batch_number", length = 50)
    private String batchNumber;

    @Column(name = "quantity_on_hand", nullable = false, precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    @Column(name = "quantity_reserved", precision = 12, scale = 3)
    @Builder.Default
    private BigDecimal quantityReserved = BigDecimal.ZERO;

    @Column(name = "unit_cost", precision = 12, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Column(name = "location_in_warehouse", length = 50)
    private String locationInWarehouse;

    public BigDecimal getAvailableQuantity() {
        return quantityOnHand.subtract(quantityReserved);
    }
}
