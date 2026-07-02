package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.StockItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, UUID> {

    @Query("""
        SELECT s FROM StockItem s
        WHERE s.ingredient.id = :ingredientId
        AND s.warehouse.id = :warehouseId
        AND s.active = true
        ORDER BY s.expiryDate ASC NULLS LAST
    """)
    List<StockItem> findByIngredientAndWarehouseOrderByExpiry(
        @Param("ingredientId") UUID ingredientId,
        @Param("warehouseId") UUID warehouseId
    );

    @Query("""
        SELECT SUM(s.quantityOnHand) FROM StockItem s
        WHERE s.ingredient.id = :ingredientId
        AND s.active = true
    """)
    BigDecimal getTotalStockByIngredient(@Param("ingredientId") UUID ingredientId);

    @Query("""
        SELECT s FROM StockItem s
        WHERE s.expiryDate <= :expiryDate
        AND s.quantityOnHand > 0
        AND s.active = true
    """)
    List<StockItem> findExpiringStock(@Param("expiryDate") LocalDate expiryDate);

    @Query("""
        SELECT s FROM StockItem s
        WHERE s.active = true
        AND (:warehouseId IS NULL OR s.warehouse.id = :warehouseId)
        AND (:ingredientId IS NULL OR s.ingredient.id = :ingredientId)
    """)
    Page<StockItem> findStockWithFilters(
        @Param("warehouseId") UUID warehouseId,
        @Param("ingredientId") UUID ingredientId,
        Pageable pageable
    );

    @Query("""
        SELECT s FROM StockItem s
        WHERE s.ingredient.id = :ingredientId
        AND s.quantityOnHand > 0
        AND s.active = true
        ORDER BY s.expiryDate ASC NULLS LAST, s.receivedDate ASC
    """)
    List<StockItem> findFEFOStock(@Param("ingredientId") UUID ingredientId);
}
