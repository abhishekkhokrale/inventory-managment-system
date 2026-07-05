package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.request.UnitOfMeasureRequest;
import com.kitchen.inventory.entity.UnitOfMeasure;
import com.kitchen.inventory.service.UnitOfMeasureService;
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
@RequestMapping("/units-of-measure")
@RequiredArgsConstructor
@Tag(name = "Units of Measure", description = "Unit of measure management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UnitOfMeasureController {

    private final UnitOfMeasureService unitOfMeasureService;

    @GetMapping
    @Operation(summary = "List all units of measure")
    @PreAuthorize("hasAnyAuthority('INGREDIENT_READ', 'INVENTORY_READ')")
    public ResponseEntity<List<UnitOfMeasure>> getAllUnitsOfMeasure() {
        return ResponseEntity.ok(unitOfMeasureService.getAllUnitsOfMeasure());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get unit of measure by ID")
    @PreAuthorize("hasAnyAuthority('INGREDIENT_READ', 'INVENTORY_READ')")
    public ResponseEntity<UnitOfMeasure> getUnitOfMeasure(@PathVariable UUID id) {
        return ResponseEntity.ok(unitOfMeasureService.getUnitOfMeasureById(id));
    }

    @PostMapping
    @Operation(summary = "Create a unit of measure (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UnitOfMeasure> createUnitOfMeasure(@Valid @RequestBody UnitOfMeasureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(unitOfMeasureService.createUnitOfMeasure(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a unit of measure (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UnitOfMeasure> updateUnitOfMeasure(@PathVariable UUID id, @Valid @RequestBody UnitOfMeasureRequest request) {
        return ResponseEntity.ok(unitOfMeasureService.updateUnitOfMeasure(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete (soft) a unit of measure (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteUnitOfMeasure(@PathVariable UUID id) {
        unitOfMeasureService.deleteUnitOfMeasure(id);
        return ResponseEntity.noContent().build();
    }
}
