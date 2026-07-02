package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.dto.request.IngredientRequest;
import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Category;
import com.kitchen.inventory.entity.Ingredient;
import com.kitchen.inventory.entity.UnitOfMeasure;
import com.kitchen.inventory.enums.StorageType;
import com.kitchen.inventory.exception.DuplicateResourceException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.CategoryRepository;
import com.kitchen.inventory.repository.IngredientRepository;
import com.kitchen.inventory.repository.UnitOfMeasureRepository;
import com.kitchen.inventory.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IngredientServiceImpl implements IngredientService {

    private final IngredientRepository ingredientRepository;
    private final CategoryRepository categoryRepository;
    private final UnitOfMeasureRepository uomRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<Ingredient> getIngredients(String search, UUID categoryId,
                                                      StorageType storageType, Pageable pageable) {
        String searchParam = search.isEmpty() ? null : "%" + search.toLowerCase() + "%";
        Page<Ingredient> page = ingredientRepository.searchIngredients(
            searchParam, categoryId, storageType, pageable);
        return PagedResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public Ingredient getIngredientById(UUID id) {
        return ingredientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", id));
    }

    @Override
    @Transactional
    public Ingredient createIngredient(IngredientRequest request) {
        if (ingredientRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Ingredient", "code", request.getCode());
        }
        if (request.getBarcode() != null && ingredientRepository.existsByBarcode(request.getBarcode())) {
            throw new DuplicateResourceException("Ingredient", "barcode", request.getBarcode());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        UnitOfMeasure uom = uomRepository.findById(request.getUnitOfMeasureId())
            .orElseThrow(() -> new ResourceNotFoundException("UnitOfMeasure", "id", request.getUnitOfMeasureId()));

        Ingredient ingredient = Ingredient.builder()
            .name(request.getName())
            .code(request.getCode())
            .description(request.getDescription())
            .category(category)
            .unitOfMeasure(uom)
            .shelfLifeDays(request.getShelfLifeDays())
            .reorderLevel(request.getReorderLevel())
            .minimumStock(request.getMinimumStock())
            .maximumStock(request.getMaximumStock())
            .storageType(request.getStorageType())
            .standardCost(request.getStandardCost())
            .barcode(request.getBarcode())
            .allergens(request.getAllergens())
            .perishable(request.isPerishable())
            .trackBatch(request.isTrackBatch())
            .trackExpiry(request.isTrackExpiry())
            .build();

        return ingredientRepository.save(ingredient);
    }

    @Override
    @Transactional
    public Ingredient updateIngredient(UUID id, IngredientRequest request) {
        Ingredient ingredient = getIngredientById(id);

        if (!ingredient.getCode().equals(request.getCode()) && ingredientRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Ingredient", "code", request.getCode());
        }

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        UnitOfMeasure uom = uomRepository.findById(request.getUnitOfMeasureId())
            .orElseThrow(() -> new ResourceNotFoundException("UnitOfMeasure", "id", request.getUnitOfMeasureId()));

        ingredient.setName(request.getName());
        ingredient.setCode(request.getCode());
        ingredient.setDescription(request.getDescription());
        ingredient.setCategory(category);
        ingredient.setUnitOfMeasure(uom);
        ingredient.setShelfLifeDays(request.getShelfLifeDays());
        ingredient.setReorderLevel(request.getReorderLevel());
        ingredient.setMinimumStock(request.getMinimumStock());
        ingredient.setMaximumStock(request.getMaximumStock());
        ingredient.setStorageType(request.getStorageType());
        ingredient.setStandardCost(request.getStandardCost());
        ingredient.setBarcode(request.getBarcode());
        ingredient.setAllergens(request.getAllergens());
        ingredient.setPerishable(request.isPerishable());
        ingredient.setTrackBatch(request.isTrackBatch());
        ingredient.setTrackExpiry(request.isTrackExpiry());

        return ingredientRepository.save(ingredient);
    }

    @Override
    @Transactional
    public void deleteIngredient(UUID id) {
        Ingredient ingredient = getIngredientById(id);
        ingredient.setActive(false);
        ingredientRepository.save(ingredient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ingredient> getLowStockIngredients() {
        return ingredientRepository.findIngredientsBelowReorderLevel();
    }
}
