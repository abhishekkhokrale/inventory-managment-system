package com.kitchen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipes", indexes = {
    @Index(name = "idx_recipe_code", columnList = "code"),
    @Index(name = "idx_recipe_kitchen", columnList = "kitchen_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 30)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;

    @Column(name = "yield_quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal yieldQuantity;

    @Column(name = "yield_unit", length = 20)
    private String yieldUnit;

    @Column(name = "serving_size", precision = 10, scale = 3)
    private BigDecimal servingSize;

    @Column(name = "preparation_time_minutes")
    private Integer preparationTimeMinutes;

    @Column(name = "cooking_time_minutes")
    private Integer cookingTimeMinutes;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "total_cost", precision = 12, scale = 4)
    private BigDecimal totalCost;

    @Column(name = "cost_per_serving", precision = 12, scale = 4)
    private BigDecimal costPerServing;

    @Column(name = "is_published")
    @Builder.Default
    private boolean published = false;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RecipeIngredient> ingredients = new ArrayList<>();
}
