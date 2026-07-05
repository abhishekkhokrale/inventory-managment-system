package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.PurchaseOrder;
import com.kitchen.inventory.enums.StockTransactionType;
import com.kitchen.inventory.repository.IngredientRepository;
import com.kitchen.inventory.repository.PurchaseOrderRepository;
import com.kitchen.inventory.repository.StockItemRepository;
import com.kitchen.inventory.repository.StockTransactionRepository;
import com.kitchen.inventory.repository.SupplierRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
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
    private final PurchaseOrderRepository purchaseOrderRepository;

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

    @GetMapping("/stock")
    @Operation(summary = "Stock report: opening/in/out/closing per ingredient and warehouse")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    @Transactional(readOnly = true)
    public ResponseEntity<PagedResponse<Map<String, Object>>> getStockReport(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        LocalDateTime from = (fromDate != null ? fromDate : LocalDate.now().minusDays(30)).atStartOfDay();
        LocalDateTime to = (toDate != null ? toDate : LocalDate.now()).atTime(23, 59, 59);

        List<StockItemRepository.StockSummaryRow> rows = stockItemRepository.getStockSummary();
        List<Map<String, Object>> content = rows.stream().map(row -> {
            BigDecimal stockIn = stockTransactionRepository.sumQuantityByTypeAndDateRange(
                row.getIngredientId(), StockTransactionType.STOCK_IN, from, to);
            BigDecimal stockOut = stockTransactionRepository.sumQuantityByTypeAndDateRange(
                row.getIngredientId(), StockTransactionType.STOCK_OUT, from, to);
            stockIn = stockIn != null ? stockIn : BigDecimal.ZERO;
            stockOut = stockOut != null ? stockOut : BigDecimal.ZERO;
            BigDecimal closing = row.getClosingStock() != null ? row.getClosingStock() : BigDecimal.ZERO;
            BigDecimal opening = closing.subtract(stockIn).add(stockOut);

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("ingredientName", row.getIngredientName());
            map.put("category", row.getCategory());
            map.put("warehouse", row.getWarehouse());
            map.put("openingStock", opening);
            map.put("stockIn", stockIn);
            map.put("stockOut", stockOut);
            map.put("closingStock", closing);
            map.put("value", row.getValue());
            return map;
        }).toList();

        return ResponseEntity.ok(toPagedResponse(content));
    }

    @GetMapping("/consumption")
    @Operation(summary = "Consumption report: daily quantity and cost consumed")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getConsumptionReport(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        LocalDateTime from = (fromDate != null ? fromDate : LocalDate.now().minusDays(30)).atStartOfDay();
        LocalDateTime to = (toDate != null ? toDate : LocalDate.now()).atTime(23, 59, 59);

        List<StockTransactionRepository.DailyAggregateRow> rows = stockTransactionRepository.getDailyAggregates(
            List.of(StockTransactionType.CONSUMPTION.name(), StockTransactionType.STOCK_OUT.name()), from, to);

        List<Map<String, Object>> content = rows.stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("date", row.getTxnDate().toString());
            map.put("quantity", row.getQuantity());
            map.put("cost", row.getCost());
            return map;
        }).toList();
        return ResponseEntity.ok(content);
    }

    @GetMapping("/purchase")
    @Operation(summary = "Purchase report: orders within date range")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    @Transactional(readOnly = true)
    public ResponseEntity<PagedResponse<Map<String, Object>>> getPurchaseReport(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        LocalDate from = fromDate != null ? fromDate : LocalDate.now().minusDays(30);
        LocalDate to = toDate != null ? toDate : LocalDate.now();

        Page<PurchaseOrder> orders = purchaseOrderRepository.searchOrders(
            null, null, null, from, to, PageRequest.of(0, 500));

        List<Map<String, Object>> content = orders.getContent().stream().map(po -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("orderNumber", po.getOrderNumber());
            map.put("supplier", po.getSupplier() != null ? po.getSupplier().getName() : null);
            map.put("orderDate", po.getOrderDate() != null ? po.getOrderDate().toString() : null);
            map.put("status", po.getStatus() != null ? po.getStatus().name() : null);
            map.put("totalAmount", po.getTotalAmount());
            return map;
        }).toList();

        return ResponseEntity.ok(toPagedResponse(content));
    }

    @GetMapping("/waste")
    @Operation(summary = "Waste report: daily wasted quantity and cost")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getWasteReport(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        LocalDateTime from = (fromDate != null ? fromDate : LocalDate.now().minusDays(30)).atStartOfDay();
        LocalDateTime to = (toDate != null ? toDate : LocalDate.now()).atTime(23, 59, 59);

        List<StockTransactionRepository.DailyAggregateRow> rows = stockTransactionRepository.getDailyAggregates(
            List.of(StockTransactionType.WASTE.name(), StockTransactionType.DAMAGED.name(),
                    StockTransactionType.EXPIRED.name()), from, to);

        List<Map<String, Object>> content = rows.stream().map(row -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("date", row.getTxnDate().toString());
            map.put("wasteQuantity", row.getQuantity());
            map.put("wasteCost", row.getCost());
            return map;
        }).toList();
        return ResponseEntity.ok(content);
    }

    @GetMapping("/valuation")
    @Operation(summary = "Inventory valuation report: total quantity and value per ingredient")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    @Transactional(readOnly = true)
    public ResponseEntity<PagedResponse<Map<String, Object>>> getValuationReport() {
        List<StockItemRepository.ValuationRow> rows = stockItemRepository.getValuationReport();

        List<Map<String, Object>> content = rows.stream().map(row -> {
            BigDecimal totalQuantity = row.getTotalQuantity() != null ? row.getTotalQuantity() : BigDecimal.ZERO;
            BigDecimal totalValue = row.getTotalValue() != null ? row.getTotalValue() : BigDecimal.ZERO;
            BigDecimal averageCost = totalQuantity.compareTo(BigDecimal.ZERO) > 0
                ? totalValue.divide(totalQuantity, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("ingredientName", row.getIngredientName());
            map.put("category", row.getCategory());
            map.put("totalQuantity", totalQuantity);
            map.put("averageCost", averageCost);
            map.put("totalValue", totalValue);
            map.put("valuationMethod", "WEIGHTED_AVG");
            return map;
        }).toList();

        return ResponseEntity.ok(toPagedResponse(content));
    }

    private PagedResponse<Map<String, Object>> toPagedResponse(List<Map<String, Object>> content) {
        Page<Map<String, Object>> page = new PageImpl<>(content);
        return PagedResponse.from(page);
    }
}
