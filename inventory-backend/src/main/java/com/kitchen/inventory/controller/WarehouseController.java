package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.request.WarehouseRequest;
import com.kitchen.inventory.entity.Warehouse;
import com.kitchen.inventory.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouses", description = "Warehouse management APIs")
@SecurityRequirement(name = "bearerAuth")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @Operation(summary = "List all active warehouses")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    public ResponseEntity<Warehouse> getWarehouse(@PathVariable UUID id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @PostMapping
    @Operation(summary = "Create a warehouse (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Warehouse> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(warehouseService.createWarehouse(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a warehouse (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable UUID id, @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete (soft) a warehouse (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable UUID id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }
}
