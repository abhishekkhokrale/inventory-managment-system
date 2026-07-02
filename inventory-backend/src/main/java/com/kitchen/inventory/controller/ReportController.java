package com.kitchen.inventory.controller;

import com.kitchen.inventory.repository.IngredientRepository;
import com.kitchen.inventory.repository.StockItemRepository;
import com.kitchen.inventory.repository.StockTransactionRepository;
import com.kitchen.inventory.repository.SupplierRepository;
import com.kitchen.inventory.enums.StockTransactionType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Inventory reporting APIs")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final StockItemRepository stockItemRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final IngredientRepository ingredientRepository;
    private final SupplierRepository supplierRepository;

    @GetMapping("/inventory")
    @Operation(summary = "Inventory summary report")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getInventoryReport() {
        long totalIngredients = ingredientRepository.count();
        long lowStockCount = ingredientRepository.findIngredientsBelowReorderLevel().size();

        var stockPage = stockItemRepository.findStockWithFilters(null, null, PageRequest.of(0, 1000));
        BigDecimal totalStockValue = stockPage.getContent().stream()
            .map(s -> {
                BigDecimal qty = s.getQuantityOnHand() != null ? s.getQuantityOnHand() : BigDecimal.ZERO;
                BigDecimal cost = s.getUnitCost() != null ? s.getUnitCost() : BigDecimal.ZERO;
                return qty.multiply(cost);
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalIngredients", totalIngredients);
        report.put("activeStockItems", stockPage.getTotalElements());
        report.put("totalStockValue", totalStockValue);
        report.put("lowStockIngredients", lowStockCount);
        report.put("activeSuppliers", supplierRepository.count());
        report.put("generatedAt", LocalDateTime.now().toString());
        return ResponseEntity.ok(report);
    }

    @GetMapping("/stock-movement")
    @Operation(summary = "Stock movement report (last 30 days)")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getStockMovementReport(
            @RequestParam(defaultValue = "30") int days) {
        LocalDateTime from = LocalDateTime.now().minusDays(days);
        LocalDateTime to = LocalDateTime.now();

        var txnPage = stockTransactionRepository.searchTransactions(null, null, from, to, PageRequest.of(0, 1000));
        long stockInCount = txnPage.getContent().stream()
            .filter(t -> t.getTransactionType() == StockTransactionType.STOCK_IN).count();
        long stockOutCount = txnPage.getContent().stream()
            .filter(t -> t.getTransactionType() == StockTransactionType.STOCK_OUT).count();
        long adjustmentCount = txnPage.getContent().stream()
            .filter(t -> t.getTransactionType() != StockTransactionType.STOCK_IN
                      && t.getTransactionType() != StockTransactionType.STOCK_OUT).count();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("periodDays", days);
        report.put("totalTransactions", txnPage.getTotalElements());
        report.put("stockInCount", stockInCount);
        report.put("stockOutCount", stockOutCount);
        report.put("adjustmentCount", adjustmentCount);
        report.put("from", from.toString());
        report.put("to", to.toString());
        return ResponseEntity.ok(report);
    }
}
