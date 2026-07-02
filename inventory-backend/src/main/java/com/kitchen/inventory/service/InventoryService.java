package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.request.StockAdjustmentRequest;
import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.StockItem;
import com.kitchen.inventory.entity.StockTransaction;
import com.kitchen.inventory.enums.StockTransactionType;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface InventoryService {
    void processStockIn(StockAdjustmentRequest request);
    void processStockOut(StockAdjustmentRequest request);
    void processAdjustment(StockAdjustmentRequest request);
    PagedResponse<StockItem> getStockLevels(UUID warehouseId, UUID ingredientId, Pageable pageable);
    List<StockItem> getExpiringStock(int daysThreshold);
    PagedResponse<StockTransaction> getTransactions(UUID ingredientId, StockTransactionType type,
                                                    LocalDateTime fromDate, LocalDateTime toDate,
                                                    Pageable pageable);
}
