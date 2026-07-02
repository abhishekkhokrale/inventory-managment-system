package com.kitchen.inventory.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface DashboardService {
    Map<String, Object> getKPIs(UUID kitchenId);
    List<Map<String, Object>> getInventoryTrends(UUID kitchenId, int days);
    List<Map<String, Object>> getTopConsumedIngredients(UUID kitchenId, int limit);
    List<Map<String, Object>> getWasteAnalysis(UUID kitchenId, int days);
    Map<String, Object> getLowStockAlerts();
}
