package com.kitchen.inventory.controller;

import com.kitchen.inventory.entity.Category;
import com.kitchen.inventory.repository.CategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Ingredient category APIs")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    @Operation(summary = "List all active ingredient categories")
    @PreAuthorize("hasAnyAuthority('INGREDIENT_READ', 'INVENTORY_READ')")
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryRepository.findByParentIsNullAndActiveTrue();
        return ResponseEntity.ok(categories);
    }
}
