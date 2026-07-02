package com.kitchen.inventory.controller;

import com.kitchen.inventory.entity.Warehouse;
import com.kitchen.inventory.repository.WarehouseRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouses", description = "Warehouse management APIs")
@SecurityRequirement(name = "bearerAuth")
public class WarehouseController {

    private final WarehouseRepository warehouseRepository;

    @GetMapping
    @Operation(summary = "List all active warehouses")
    @PreAuthorize("hasAuthority('INVENTORY_READ')")
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        List<Warehouse> warehouses = warehouseRepository.findAll().stream()
                .filter(Warehouse::isActive)
                .toList();
        return ResponseEntity.ok(warehouses);
    }
}
