package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.request.StockAdjustmentRequest;
import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.StockItem;
import com.kitchen.inventory.entity.StockTransaction;
import com.kitchen.inventory.enums.StockTransactionType;
import com.kitchen.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Inventory management APIs")
@SecurityRequirement(name = "bearerAuth")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/stock")
    @Operation(summary = "Get current stock levels")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    public ResponseEntity<PagedResponse<StockItem>> getStockLevels(
            @RequestParam(required = false) UUID warehouseId,
            @RequestParam(required = false) UUID ingredientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getStockLevels(warehouseId, ingredientId,
            PageRequest.of(page, size)));
    }

    @PostMapping("/stock-in")
    @Operation(summary = "Process stock in")
    @PreAuthorize("hasAuthority('INVENTORY_CREATE')")
    public ResponseEntity<Void> stockIn(@Valid @RequestBody StockAdjustmentRequest request) {
        inventoryService.processStockIn(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/stock-out")
    @Operation(summary = "Process stock out")
    @PreAuthorize("hasAuthority('INVENTORY_UPDATE')")
    public ResponseEntity<Void> stockOut(@Valid @RequestBody StockAdjustmentRequest request) {
        inventoryService.processStockOut(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/adjustment")
    @Operation(summary = "Stock adjustment (waste, damaged, expired)")
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    public ResponseEntity<Void> adjustment(@Valid @RequestBody StockAdjustmentRequest request) {
        inventoryService.processAdjustment(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/expiring")
    @Operation(summary = "Get expiring stock")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    public ResponseEntity<List<StockItem>> getExpiringStock(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(inventoryService.getExpiringStock(days));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get stock transactions")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    public ResponseEntity<PagedResponse<StockTransaction>> getTransactions(
            @RequestParam(required = false) UUID ingredientId,
            @RequestParam(required = false) StockTransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getTransactions(ingredientId, type, fromDate, toDate,
            PageRequest.of(page, size)));
    }
}
