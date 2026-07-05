package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.request.CategoryRequest;
import com.kitchen.inventory.entity.Category;
import com.kitchen.inventory.service.CategoryService;
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
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Ingredient category APIs")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List all active ingredient categories")
    @PreAuthorize("hasAnyAuthority('INGREDIENT_READ', 'INVENTORY_READ')")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    @PreAuthorize("hasAnyAuthority('INGREDIENT_READ', 'INVENTORY_READ')")
    public ResponseEntity<Category> getCategory(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    @Operation(summary = "Create a category (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete (soft) a category (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
