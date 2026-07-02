package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.request.IngredientRequest;
import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Ingredient;
import com.kitchen.inventory.enums.StorageType;
import com.kitchen.inventory.service.IngredientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/ingredients")
@RequiredArgsConstructor
@Tag(name = "Ingredients", description = "Ingredient master management APIs")
@SecurityRequirement(name = "bearerAuth")
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    @Operation(summary = "Get all ingredients")
    @PreAuthorize("hasAuthority('INGREDIENT_READ')")
    public ResponseEntity<PagedResponse<Ingredient>> getIngredients(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) StorageType storageType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ingredientService.getIngredients(search, categoryId, storageType, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ingredient by ID")
    @PreAuthorize("hasAuthority('INGREDIENT_READ')")
    public ResponseEntity<Ingredient> getIngredient(@PathVariable UUID id) {
        return ResponseEntity.ok(ingredientService.getIngredientById(id));
    }

    @PostMapping
    @Operation(summary = "Create ingredient")
    @PreAuthorize("hasAuthority('INGREDIENT_CREATE')")
    public ResponseEntity<Ingredient> createIngredient(@Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ingredientService.createIngredient(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ingredient")
    @PreAuthorize("hasAuthority('INGREDIENT_UPDATE')")
    public ResponseEntity<Ingredient> updateIngredient(@PathVariable UUID id,
                                                         @Valid @RequestBody IngredientRequest request) {
        return ResponseEntity.ok(ingredientService.updateIngredient(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete ingredient")
    @PreAuthorize("hasAuthority('INGREDIENT_DELETE')")
    public ResponseEntity<Void> deleteIngredient(@PathVariable UUID id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get ingredients below reorder level")
    @PreAuthorize("hasAuthority('INGREDIENT_READ')")
    public ResponseEntity<?> getLowStockIngredients() {
        return ResponseEntity.ok(ingredientService.getLowStockIngredients());
    }
}
