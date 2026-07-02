package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.dto.request.StockAdjustmentRequest;
import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.*;
import com.kitchen.inventory.enums.StockTransactionType;
import com.kitchen.inventory.exception.BusinessException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.*;
import com.kitchen.inventory.security.UserPrincipal;
import com.kitchen.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final StockItemRepository stockItemRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final IngredientRepository ingredientRepository;
    private final WarehouseRepository warehouseRepository;
    private final UnitOfMeasureRepository uomRepository;
    private final UserRepository userRepository;

    private static final AtomicInteger txnCounter = new AtomicInteger(0);

    @Override
    @Transactional
    public void processStockIn(StockAdjustmentRequest request) {
        Ingredient ingredient = ingredientRepository.findById(request.getIngredientId())
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", request.getIngredientId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
            .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));
        UnitOfMeasure uom = uomRepository.findById(request.getUnitOfMeasureId())
            .orElseThrow(() -> new ResourceNotFoundException("UnitOfMeasure", "id", request.getUnitOfMeasureId()));

        StockItem stockItem = findOrCreateStockItem(ingredient, warehouse, request.getBatchNumber(), request.getExpiryDate());
        stockItem.setQuantityOnHand(stockItem.getQuantityOnHand().add(request.getQuantity()));
        if (request.getUnitCost() != null) {
            stockItem.setUnitCost(request.getUnitCost());
        }
        stockItemRepository.save(stockItem);

        recordTransaction(ingredient, null, warehouse, request, StockTransactionType.STOCK_IN);
    }

    @Override
    @Transactional
    public void processStockOut(StockAdjustmentRequest request) {
        Ingredient ingredient = ingredientRepository.findById(request.getIngredientId())
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", request.getIngredientId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
            .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));

        BigDecimal totalAvailable = stockItemRepository.getTotalStockByIngredient(request.getIngredientId());
        if (totalAvailable == null || totalAvailable.compareTo(request.getQuantity()) < 0) {
            throw new BusinessException("Insufficient stock. Available: " + (totalAvailable != null ? totalAvailable : 0));
        }

        // FEFO deduction
        List<StockItem> stockItems = stockItemRepository.findFEFOStock(request.getIngredientId());
        BigDecimal remaining = request.getQuantity();

        for (StockItem item : stockItems) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
            if (item.getWarehouse().getId().equals(request.getWarehouseId())) {
                BigDecimal deduct = remaining.min(item.getQuantityOnHand());
                item.setQuantityOnHand(item.getQuantityOnHand().subtract(deduct));
                remaining = remaining.subtract(deduct);
                stockItemRepository.save(item);
            }
        }

        recordTransaction(ingredient, warehouse, null, request, StockTransactionType.STOCK_OUT);
    }

    @Override
    @Transactional
    public void processAdjustment(StockAdjustmentRequest request) {
        if (request.getTransactionType() == StockTransactionType.STOCK_IN) {
            processStockIn(request);
        } else if (request.getTransactionType() == StockTransactionType.STOCK_OUT ||
                   request.getTransactionType() == StockTransactionType.WASTE ||
                   request.getTransactionType() == StockTransactionType.DAMAGED ||
                   request.getTransactionType() == StockTransactionType.EXPIRED) {
            processStockOut(request);
        } else {
            throw new BusinessException("Invalid transaction type for adjustment: " + request.getTransactionType());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<StockItem> getStockLevels(UUID warehouseId, UUID ingredientId, Pageable pageable) {
        Page<StockItem> page = stockItemRepository.findStockWithFilters(warehouseId, ingredientId, pageable);
        return PagedResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockItem> getExpiringStock(int daysThreshold) {
        LocalDate thresholdDate = LocalDate.now().plusDays(daysThreshold);
        return stockItemRepository.findExpiringStock(thresholdDate);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<StockTransaction> getTransactions(UUID ingredientId, StockTransactionType type,
                                                           LocalDateTime fromDate, LocalDateTime toDate,
                                                           Pageable pageable) {
        LocalDateTime effectiveFrom = fromDate != null ? fromDate : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime effectiveTo = toDate != null ? toDate : LocalDateTime.now().plusYears(100);
        Page<StockTransaction> page = stockTransactionRepository.searchTransactions(
            ingredientId, type, effectiveFrom, effectiveTo, pageable);
        return PagedResponse.from(page);
    }

    private StockItem findOrCreateStockItem(Ingredient ingredient, Warehouse warehouse,
                                             String batchNumber, LocalDate expiryDate) {
        List<StockItem> existing = stockItemRepository
            .findByIngredientAndWarehouseOrderByExpiry(ingredient.getId(), warehouse.getId());

        return existing.stream()
            .filter(s -> batchNumberMatches(s.getBatchNumber(), batchNumber))
            .findFirst()
            .orElseGet(() -> StockItem.builder()
                .ingredient(ingredient)
                .warehouse(warehouse)
                .batchNumber(batchNumber)
                .expiryDate(expiryDate)
                .receivedDate(LocalDate.now())
                .quantityOnHand(BigDecimal.ZERO)
                .quantityReserved(BigDecimal.ZERO)
                .build());
    }

    private boolean batchNumberMatches(String existing, String incoming) {
        if (incoming == null) return existing == null;
        return incoming.equals(existing);
    }

    private void recordTransaction(Ingredient ingredient, Warehouse fromWarehouse, Warehouse toWarehouse,
                                    StockAdjustmentRequest request, StockTransactionType type) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();
        User user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        UnitOfMeasure uom = uomRepository.findById(request.getUnitOfMeasureId())
            .orElseThrow(() -> new ResourceNotFoundException("UnitOfMeasure", "id", request.getUnitOfMeasureId()));

        String txnNumber = "TXN" + System.currentTimeMillis() + txnCounter.incrementAndGet();

        StockTransaction transaction = StockTransaction.builder()
            .transactionNumber(txnNumber)
            .transactionType(type)
            .ingredient(ingredient)
            .fromWarehouse(fromWarehouse)
            .toWarehouse(toWarehouse)
            .quantity(request.getQuantity())
            .unitOfMeasure(uom)
            .unitCost(request.getUnitCost())
            .batchNumber(request.getBatchNumber())
            .expiryDate(request.getExpiryDate())
            .transactionDate(LocalDateTime.now())
            .remarks(request.getRemarks())
            .performedBy(user)
            .build();

        stockTransactionRepository.save(transaction);
    }
}
