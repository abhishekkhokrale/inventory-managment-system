package com.kitchen.inventory.entity;

import com.kitchen.inventory.enums.StorageType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ingredients", indexes = {
    @Index(name = "idx_ingredients_code", columnList = "code"),
    @Index(name = "idx_ingredients_category", columnList = "category_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 30)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uom_id", nullable = false)
    private UnitOfMeasure unitOfMeasure;

    @Column(name = "shelf_life_days")
    private Integer shelfLifeDays;

    @Column(name = "reorder_level", precision = 10, scale = 3)
    private BigDecimal reorderLevel;

    @Column(name = "minimum_stock", precision = 10, scale = 3)
    private BigDecimal minimumStock;

    @Column(name = "maximum_stock", precision = 10, scale = 3)
    private BigDecimal maximumStock;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false)
    private StorageType storageType;

    @Column(name = "standard_cost", precision = 12, scale = 4)
    private BigDecimal standardCost;

    @Column(name = "barcode", length = 50)
    private String barcode;

    @Column(name = "qr_code", length = 200)
    private String qrCode;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "allergens", length = 200)
    private String allergens;

    @Column(name = "is_perishable", nullable = false)
    @Builder.Default
    private boolean perishable = true;

    @Column(name = "track_batch", nullable = false)
    @Builder.Default
    private boolean trackBatch = true;

    @Column(name = "track_expiry", nullable = false)
    @Builder.Default
    private boolean trackExpiry = true;
}
