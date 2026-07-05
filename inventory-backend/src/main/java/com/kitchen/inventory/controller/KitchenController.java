package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.request.KitchenRequest;
import com.kitchen.inventory.entity.Kitchen;
import com.kitchen.inventory.service.KitchenService;
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
@RequestMapping("/kitchens")
@RequiredArgsConstructor
@Tag(name = "Kitchens", description = "Kitchen management APIs")
@SecurityRequirement(name = "bearerAuth")
public class KitchenController {

    private final KitchenService kitchenService;

    @GetMapping
    @Operation(summary = "List all active kitchens")
    @PreAuthorize("hasAuthority('KITCHEN_READ')")
    public ResponseEntity<List<Kitchen>> getAllKitchens() {
        return ResponseEntity.ok(kitchenService.getAllKitchens());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get kitchen by ID")
    @PreAuthorize("hasAuthority('KITCHEN_READ')")
    public ResponseEntity<Kitchen> getKitchen(@PathVariable UUID id) {
        return ResponseEntity.ok(kitchenService.getKitchenById(id));
    }

    @PostMapping
    @Operation(summary = "Create a kitchen (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Kitchen> createKitchen(@Valid @RequestBody KitchenRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(kitchenService.createKitchen(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a kitchen (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Kitchen> updateKitchen(@PathVariable UUID id, @Valid @RequestBody KitchenRequest request) {
        return ResponseEntity.ok(kitchenService.updateKitchen(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete (soft) a kitchen (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteKitchen(@PathVariable UUID id) {
        kitchenService.deleteKitchen(id);
        return ResponseEntity.noContent().build();
    }
}
