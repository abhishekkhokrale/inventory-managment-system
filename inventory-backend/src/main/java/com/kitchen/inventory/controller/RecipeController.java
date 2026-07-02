package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Kitchen;
import com.kitchen.inventory.entity.Recipe;
import com.kitchen.inventory.exception.BusinessException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.KitchenRepository;
import com.kitchen.inventory.repository.RecipeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/recipes")
@RequiredArgsConstructor
@Tag(name = "Recipes", description = "Recipe management APIs")
@SecurityRequirement(name = "bearerAuth")
public class RecipeController {

    private final RecipeRepository recipeRepository;
    private final KitchenRepository kitchenRepository;

    @Data
    public static class CreateRecipeRequest {
        @NotBlank private String name;
        @NotBlank private String code;
        private String description;
        @NotNull private UUID kitchenId;
        @NotNull private BigDecimal yieldQuantity;
        private String yieldUnit;
        private BigDecimal servingSize;
        private Integer preparationTimeMinutes;
        private Integer cookingTimeMinutes;
        private String instructions;
        private boolean published = false;
    }

    @GetMapping
    @Operation(summary = "List recipes")
    @PreAuthorize("hasAuthority('RECIPE_READ')")
    public ResponseEntity<PagedResponse<Recipe>> listRecipes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean published,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String searchParam = (search != null && !search.isEmpty()) ? "%" + search.toLowerCase() + "%" : null;
        var recipes = recipeRepository.searchRecipes(null, searchParam, published, PageRequest.of(page, size));
        return ResponseEntity.ok(PagedResponse.from(recipes));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get recipe by ID")
    @PreAuthorize("hasAuthority('RECIPE_READ')")
    public ResponseEntity<Recipe> getRecipe(@PathVariable UUID id) {
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
        return ResponseEntity.ok(recipe);
    }

    @PostMapping
    @Operation(summary = "Create recipe")
    @PreAuthorize("hasAuthority('RECIPE_CREATE')")
    @Transactional
    public ResponseEntity<Recipe> createRecipe(@Valid @RequestBody CreateRecipeRequest request) {
        if (recipeRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Recipe code already exists: " + request.getCode());
        }
        Kitchen kitchen = kitchenRepository.findById(request.getKitchenId())
            .orElseThrow(() -> new ResourceNotFoundException("Kitchen", "id", request.getKitchenId()));

        Recipe recipe = Recipe.builder()
            .name(request.getName())
            .code(request.getCode())
            .description(request.getDescription())
            .kitchen(kitchen)
            .yieldQuantity(request.getYieldQuantity())
            .yieldUnit(request.getYieldUnit())
            .servingSize(request.getServingSize())
            .preparationTimeMinutes(request.getPreparationTimeMinutes())
            .cookingTimeMinutes(request.getCookingTimeMinutes())
            .instructions(request.getInstructions())
            .published(request.isPublished())
            .build();
        recipe.setActive(true);

        return ResponseEntity.ok(recipeRepository.save(recipe));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update recipe")
    @PreAuthorize("hasAuthority('RECIPE_UPDATE')")
    @Transactional
    public ResponseEntity<Recipe> updateRecipe(@PathVariable UUID id,
                                               @Valid @RequestBody CreateRecipeRequest request) {
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
        if (!recipe.getCode().equals(request.getCode()) && recipeRepository.existsByCode(request.getCode())) {
            throw new BusinessException("Recipe code already exists: " + request.getCode());
        }
        recipe.setName(request.getName());
        recipe.setCode(request.getCode());
        recipe.setDescription(request.getDescription());
        recipe.setYieldQuantity(request.getYieldQuantity());
        recipe.setYieldUnit(request.getYieldUnit());
        recipe.setServingSize(request.getServingSize());
        recipe.setPreparationTimeMinutes(request.getPreparationTimeMinutes());
        recipe.setCookingTimeMinutes(request.getCookingTimeMinutes());
        recipe.setInstructions(request.getInstructions());
        recipe.setPublished(request.isPublished());
        return ResponseEntity.ok(recipeRepository.save(recipe));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete (soft) a recipe")
    @PreAuthorize("hasAuthority('RECIPE_DELETE')")
    @Transactional
    public ResponseEntity<Void> deleteRecipe(@PathVariable UUID id) {
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
        recipe.setActive(false);
        recipeRepository.save(recipe);
        return ResponseEntity.noContent().build();
    }
}
