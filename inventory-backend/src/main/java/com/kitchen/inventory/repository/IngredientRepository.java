package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.Ingredient;
import com.kitchen.inventory.enums.StorageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, UUID> {

    Optional<Ingredient> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByBarcode(String barcode);

    @Query(value = """
        SELECT i FROM Ingredient i
        JOIN FETCH i.category
        JOIN FETCH i.unitOfMeasure
        WHERE i.active = true
        AND (:search IS NULL OR LOWER(i.name) LIKE :search
             OR LOWER(i.code) LIKE :search)
        AND (:categoryId IS NULL OR i.category.id = :categoryId)
        AND (:storageType IS NULL OR i.storageType = :storageType)
    """,
    countQuery = """
        SELECT COUNT(i) FROM Ingredient i
        WHERE i.active = true
        AND (:search IS NULL OR LOWER(i.name) LIKE :search
             OR LOWER(i.code) LIKE :search)
        AND (:categoryId IS NULL OR i.category.id = :categoryId)
        AND (:storageType IS NULL OR i.storageType = :storageType)
    """)
    Page<Ingredient> searchIngredients(
        @Param("search") String search,
        @Param("categoryId") UUID categoryId,
        @Param("storageType") StorageType storageType,
        Pageable pageable
    );

    @Query(value = """
        SELECT i.* FROM ingredients i
        JOIN stock_items s ON s.ingredient_id = i.id
        WHERE i.is_active = true
        GROUP BY i.id
        HAVING SUM(s.quantity_on_hand) <= i.reorder_level
    """, nativeQuery = true)
    List<Ingredient> findIngredientsBelowReorderLevel();
}
