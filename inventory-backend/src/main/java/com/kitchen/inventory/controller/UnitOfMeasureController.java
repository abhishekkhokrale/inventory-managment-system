package com.kitchen.inventory.controller;

import com.kitchen.inventory.entity.UnitOfMeasure;
import com.kitchen.inventory.repository.UnitOfMeasureRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/units-of-measure")
@RequiredArgsConstructor
@Tag(name = "Units of Measure", description = "Unit of measure management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UnitOfMeasureController {

    private final UnitOfMeasureRepository uomRepository;

    @GetMapping
    @Operation(summary = "List all units of measure")
    @PreAuthorize("hasAnyAuthority('INGREDIENT_READ', 'INVENTORY_READ')")
    public ResponseEntity<List<UnitOfMeasure>> getAllUnitsOfMeasure() {
        List<UnitOfMeasure> units = uomRepository.findAll().stream()
                .filter(UnitOfMeasure::isActive)
                .toList();
        return ResponseEntity.ok(units);
    }
}
