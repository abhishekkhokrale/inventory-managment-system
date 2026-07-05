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

    @Query(value = """
        SELECT s FROM StockItem s
        JOIN FETCH s.ingredient i
        JOIN FETCH i.category
        JOIN FETCH i.unitOfMeasure
        JOIN FETCH s.warehouse
        WHERE s.active = true
        AND (:warehouseId IS NULL OR s.warehouse.id = :warehouseId)
        AND (:ingredientId IS NULL OR s.ingredient.id = :ingredientId)
    """,
    countQuery = """
        SELECT COUNT(s) FROM StockItem s
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

    interface ValuationRow {
        UUID getIngredientId();
        String getIngredientName();
        String getCategory();
        BigDecimal getTotalQuantity();
        BigDecimal getTotalValue();
    }

    @Query(value = """
        SELECT i.id AS ingredientId, i.name AS ingredientName, c.name AS category,
               COALESCE(SUM(s.quantity_on_hand), 0) AS totalQuantity,
               COALESCE(SUM(s.quantity_on_hand * s.unit_cost), 0) AS totalValue
        FROM stock_items s
        JOIN ingredients i ON i.id = s.ingredient_id
        JOIN categories c ON c.id = i.category_id
        WHERE s.is_active = true
        GROUP BY i.id, i.name, c.name
        ORDER BY i.name
        """, nativeQuery = true)
    List<ValuationRow> getValuationReport();

    interface StockSummaryRow {
        UUID getIngredientId();
        String getIngredientName();
        String getCategory();
        UUID getWarehouseId();
        String getWarehouse();
        BigDecimal getClosingStock();
        BigDecimal getValue();
    }

    @Query(value = """
        SELECT i.id AS ingredientId, i.name AS ingredientName, c.name AS category, w.id AS warehouseId, w.name AS warehouse,
               COALESCE(SUM(s.quantity_on_hand), 0) AS closingStock,
               COALESCE(SUM(s.quantity_on_hand * s.unit_cost), 0) AS value
        FROM stock_items s
        JOIN ingredients i ON i.id = s.ingredient_id
        JOIN categories c ON c.id = i.category_id
        JOIN warehouses w ON w.id = s.warehouse_id
        WHERE s.is_active = true
        GROUP BY i.id, i.name, c.name, w.id, w.name
        ORDER BY i.name
        """, nativeQuery = true)
    List<StockSummaryRow> getStockSummary();
}
