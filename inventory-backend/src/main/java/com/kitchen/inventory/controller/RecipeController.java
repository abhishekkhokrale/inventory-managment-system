package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.request.RecipeRequest;
import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Recipe;
import com.kitchen.inventory.service.RecipeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/recipes")
@RequiredArgsConstructor
@Tag(name = "Recipes", description = "Recipe management APIs")
@SecurityRequirement(name = "bearerAuth")
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    @Operation(summary = "List recipes")
    @PreAuthorize("hasAuthority('RECIPE_READ')")
    public ResponseEntity<PagedResponse<Recipe>> listRecipes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean published,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(recipeService.getRecipes(search, published, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get recipe by ID")
    @PreAuthorize("hasAuthority('RECIPE_READ')")
    public ResponseEntity<Recipe> getRecipe(@PathVariable UUID id) {
        return ResponseEntity.ok(recipeService.getRecipeById(id));
    }

    @PostMapping
    @Operation(summary = "Create recipe")
    @PreAuthorize("hasAuthority('RECIPE_CREATE')")
    public ResponseEntity<Recipe> createRecipe(@Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recipeService.createRecipe(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update recipe")
    @PreAuthorize("hasAuthority('RECIPE_UPDATE')")
    public ResponseEntity<Recipe> updateRecipe(@PathVariable UUID id, @Valid @RequestBody RecipeRequest request) {
        return ResponseEntity.ok(recipeService.updateRecipe(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete (soft) a recipe")
    @PreAuthorize("hasAuthority('RECIPE_DELETE')")
    public ResponseEntity<Void> deleteRecipe(@PathVariable UUID id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
