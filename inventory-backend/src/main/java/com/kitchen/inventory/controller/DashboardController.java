package com.kitchen.inventory.controller;

import com.kitchen.inventory.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard KPI and analytics APIs")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/kpis")
    @Operation(summary = "Get KPI summary")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public ResponseEntity<Map<String, Object>> getKPIs(
            @RequestParam(required = false) UUID kitchenId) {
        return ResponseEntity.ok(dashboardService.getKPIs(kitchenId));
    }

    @GetMapping("/inventory-trends")
    @Operation(summary = "Get inventory trends (30 days)")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public ResponseEntity<?> getInventoryTrends(
            @RequestParam(required = false) UUID kitchenId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getInventoryTrends(kitchenId, days));
    }

    @GetMapping("/top-consumed")
    @Operation(summary = "Get top consumed ingredients")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public ResponseEntity<?> getTopConsumed(
            @RequestParam(required = false) UUID kitchenId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getTopConsumedIngredients(kitchenId, limit));
    }

    @GetMapping("/waste-analysis")
    @Operation(summary = "Get waste analysis")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public ResponseEntity<?> getWasteAnalysis(
            @RequestParam(required = false) UUID kitchenId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getWasteAnalysis(kitchenId, days));
    }

    @GetMapping("/low-stock-alerts")
    @Operation(summary = "Get low stock alerts count")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public ResponseEntity<?> getLowStockAlerts() {
        return ResponseEntity.ok(dashboardService.getLowStockAlerts());
    }
}
