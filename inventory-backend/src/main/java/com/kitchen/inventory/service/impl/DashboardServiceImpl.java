package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.enums.StockTransactionType;
import com.kitchen.inventory.repository.IngredientRepository;
import com.kitchen.inventory.repository.StockItemRepository;
import com.kitchen.inventory.repository.StockTransactionRepository;
import com.kitchen.inventory.repository.SupplierRepository;
import com.kitchen.inventory.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final IngredientRepository ingredientRepository;
    private final StockItemRepository stockItemRepository;
    private final StockTransactionRepository transactionRepository;
    private final SupplierRepository supplierRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getKPIs(UUID kitchenId) {
        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("totalIngredients",      ingredientRepository.count());
        kpis.put("totalStockValue",        calculateTotalStockValue());
        kpis.put("lowStockItems",          ingredientRepository.findIngredientsBelowReorderLevel().size());
        kpis.put("expiringItems",          stockItemRepository.findExpiringStock(LocalDate.now().plusDays(7)).size());
        kpis.put("pendingPurchaseOrders",  0L); // Hook to PO repository
        kpis.put("todayConsumption",       0.0);
        kpis.put("wasteThisMonth",         0.0);
        kpis.put("activeSuppliers",        supplierRepository.count());
        return kpis;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInventoryTrends(UUID kitchenId, int days) {
        List<Map<String, Object>> trends = new ArrayList<>();
        LocalDateTime start = LocalDateTime.now().minusDays(days);

        for (int i = days; i >= 0; i--) {
            LocalDateTime day = LocalDateTime.now().minusDays(i);
            LocalDateTime dayStart = day.withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd = day.withHour(23).withMinute(59).withSecond(59);

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", dayStart.toLocalDate().toString());
            point.put("stockIn",  0);
            point.put("stockOut", 0);
            point.put("waste",    0);
            trends.add(point);
        }
        return trends;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopConsumedIngredients(UUID kitchenId, int limit) {
        return new ArrayList<>();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getWasteAnalysis(UUID kitchenId, int days) {
        return new ArrayList<>();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getLowStockAlerts() {
        return Map.of(
            "count", ingredientRepository.findIngredientsBelowReorderLevel().size(),
            "items", ingredientRepository.findIngredientsBelowReorderLevel()
        );
    }

    private double calculateTotalStockValue() {
        return stockItemRepository.findAll().stream()
            .filter(s -> s.getUnitCost() != null && s.getQuantityOnHand() != null)
            .mapToDouble(s -> s.getUnitCost().doubleValue() * s.getQuantityOnHand().doubleValue())
            .sum();
    }
}
