package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.PurchaseOrder;
import com.kitchen.inventory.enums.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    @Query("""
        SELECT po FROM PurchaseOrder po
        WHERE (:kitchenId IS NULL OR po.kitchen.id = :kitchenId)
        AND (:supplierId IS NULL OR po.supplier.id = :supplierId)
        AND (:status IS NULL OR po.status = :status)
        AND po.orderDate >= :fromDate
        AND po.orderDate <= :toDate
        ORDER BY po.orderDate DESC
    """)
    Page<PurchaseOrder> searchOrders(
        @Param("kitchenId") UUID kitchenId,
        @Param("supplierId") UUID supplierId,
        @Param("status") PurchaseStatus status,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        Pageable pageable
    );

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(po.orderNumber, 4) AS int)), 0) FROM PurchaseOrder po")
    Integer getMaxOrderNumber();
}
