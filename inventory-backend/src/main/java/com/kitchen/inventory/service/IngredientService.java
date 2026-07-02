package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.request.IngredientRequest;
import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Ingredient;
import com.kitchen.inventory.enums.StorageType;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface IngredientService {
    PagedResponse<Ingredient> getIngredients(String search, UUID categoryId, StorageType storageType, Pageable pageable);
    Ingredient getIngredientById(UUID id);
    Ingredient createIngredient(IngredientRequest request);
    Ingredient updateIngredient(UUID id, IngredientRequest request);
    void deleteIngredient(UUID id);
    List<Ingredient> getLowStockIngredients();
}
