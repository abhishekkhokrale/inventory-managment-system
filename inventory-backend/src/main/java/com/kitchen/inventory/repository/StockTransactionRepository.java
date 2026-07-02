package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.StockTransaction;
import com.kitchen.inventory.enums.StockTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, UUID> {

    @Query("""
        SELECT t FROM StockTransaction t
        WHERE (:ingredientId IS NULL OR t.ingredient.id = :ingredientId)
        AND (:type IS NULL OR t.transactionType = :type)
        AND t.transactionDate >= :fromDate
        AND t.transactionDate <= :toDate
        ORDER BY t.transactionDate DESC
    """)
    Page<StockTransaction> searchTransactions(
        @Param("ingredientId") UUID ingredientId,
        @Param("type") StockTransactionType type,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable
    );

    @Query("""
        SELECT SUM(t.quantity) FROM StockTransaction t
        WHERE t.ingredient.id = :ingredientId
        AND t.transactionType = :type
        AND t.transactionDate BETWEEN :fromDate AND :toDate
    """)
    java.math.BigDecimal sumQuantityByTypeAndDateRange(
        @Param("ingredientId") UUID ingredientId,
        @Param("type") StockTransactionType type,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate
    );
}
