package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.request.RecipeRequest;
import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Recipe;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface RecipeService {
    PagedResponse<Recipe> getRecipes(String search, Boolean published, Pageable pageable);
    Recipe getRecipeById(UUID id);
    Recipe createRecipe(RecipeRequest request);
    Recipe updateRecipe(UUID id, RecipeRequest request);
    void deleteRecipe(UUID id);
}
