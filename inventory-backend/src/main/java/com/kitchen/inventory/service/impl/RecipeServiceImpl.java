package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.dto.request.RecipeIngredientRequest;
import com.kitchen.inventory.dto.request.RecipeRequest;
import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Ingredient;
import com.kitchen.inventory.entity.Kitchen;
import com.kitchen.inventory.entity.Recipe;
import com.kitchen.inventory.entity.RecipeIngredient;
import com.kitchen.inventory.entity.UnitOfMeasure;
import com.kitchen.inventory.entity.User;
import com.kitchen.inventory.exception.BusinessException;
import com.kitchen.inventory.exception.DuplicateResourceException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.IngredientRepository;
import com.kitchen.inventory.repository.KitchenRepository;
import com.kitchen.inventory.repository.RecipeRepository;
import com.kitchen.inventory.repository.UnitOfMeasureRepository;
import com.kitchen.inventory.repository.UserRepository;
import com.kitchen.inventory.security.UserPrincipal;
import com.kitchen.inventory.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final UnitOfMeasureRepository uomRepository;
    private final KitchenRepository kitchenRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<Recipe> getRecipes(String search, Boolean published, Pageable pageable) {
        String searchParam = (search != null && !search.isEmpty()) ? "%" + search.toLowerCase() + "%" : null;
        Page<Recipe> page = recipeRepository.searchRecipes(null, searchParam, published, pageable);
        return PagedResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public Recipe getRecipeById(UUID id) {
        return recipeRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));
    }

    @Override
    @Transactional
    public Recipe createRecipe(RecipeRequest request) {
        if (recipeRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Recipe", "code", request.getCode());
        }

        Recipe recipe = Recipe.builder()
            .name(request.getName())
            .code(request.getCode())
            .description(request.getDescription())
            .kitchen(resolveKitchen())
            .yieldQuantity(request.getYieldQuantity())
            .yieldUnit(request.getYieldUnit())
            .servingSize(request.getServingSize())
            .preparationTimeMinutes(request.getPreparationTimeMinutes())
            .cookingTimeMinutes(request.getCookingTimeMinutes())
            .instructions(request.getInstructions())
            .published(request.isPublished())
            .build();
        recipe.setActive(true);

        applyIngredients(recipe, request);
        applyCost(recipe);

        return recipeRepository.save(recipe);
    }

    @Override
    @Transactional
    public Recipe updateRecipe(UUID id, RecipeRequest request) {
        Recipe recipe = getRecipeById(id);

        if (!recipe.getCode().equals(request.getCode()) && recipeRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Recipe", "code", request.getCode());
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

        recipe.getIngredients().clear();
        applyIngredients(recipe, request);
        applyCost(recipe);

        return recipeRepository.save(recipe);
    }

    @Override
    @Transactional
    public void deleteRecipe(UUID id) {
        Recipe recipe = getRecipeById(id);
        recipe.setActive(false);
        recipeRepository.save(recipe);
    }

    private void applyIngredients(Recipe recipe, RecipeRequest request) {
        for (RecipeIngredientRequest item : request.getIngredients()) {
            Ingredient ingredient = ingredientRepository.findById(item.getIngredientId())
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", item.getIngredientId()));
            UnitOfMeasure uom = resolveUnitOfMeasure(item.getUnit());

            RecipeIngredient recipeIngredient = RecipeIngredient.builder()
                .recipe(recipe)
                .ingredient(ingredient)
                .quantity(item.getQuantity())
                .unitOfMeasure(uom)
                .wastePercentage(item.getWastePercentage() != null ? item.getWastePercentage() : BigDecimal.ZERO)
                .optional(item.isOptional())
                .notes(item.getNotes())
                .build();
            recipeIngredient.setActive(true);

            recipe.getIngredients().add(recipeIngredient);
        }
    }

    private UnitOfMeasure resolveUnitOfMeasure(String abbreviation) {
        return uomRepository.findByAbbreviationIgnoreCase(abbreviation.trim())
            .orElseThrow(() -> new ResourceNotFoundException("Unit of measure", "abbreviation", abbreviation));
    }

    private Kitchen resolveKitchen() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();
        User user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        if (user.getKitchen() != null) {
            return user.getKitchen();
        }
        return kitchenRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new BusinessException("No kitchen configured. Please create a kitchen before adding recipes."));
    }

    private void applyCost(Recipe recipe) {
        BigDecimal totalCost = BigDecimal.ZERO;
        for (RecipeIngredient item : recipe.getIngredients()) {
            BigDecimal lineCost = costOf(item);
            if (lineCost != null) {
                totalCost = totalCost.add(lineCost);
            }
        }
        recipe.setTotalCost(totalCost.setScale(4, RoundingMode.HALF_UP));

        BigDecimal servings = recipe.getServingSize();
        if (servings != null && servings.compareTo(BigDecimal.ZERO) > 0) {
            recipe.setCostPerServing(totalCost.divide(servings, 4, RoundingMode.HALF_UP));
        } else {
            recipe.setCostPerServing(null);
        }
    }

    private BigDecimal costOf(RecipeIngredient item) {
        Ingredient ingredient = item.getIngredient();
        if (ingredient.getStandardCost() == null) {
            return null;
        }
        BigDecimal quantityInIngredientUnit = convert(item.getQuantity(), item.getUnitOfMeasure(), ingredient.getUnitOfMeasure());
        if (quantityInIngredientUnit == null) {
            return null;
        }
        BigDecimal wasteFactor = BigDecimal.ONE.add(
            (item.getWastePercentage() != null ? item.getWastePercentage() : BigDecimal.ZERO)
                .divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
        return quantityInIngredientUnit.multiply(ingredient.getStandardCost()).multiply(wasteFactor);
    }

    private BigDecimal convert(BigDecimal quantity, UnitOfMeasure from, UnitOfMeasure to) {
        if (from == null || to == null) {
            return null;
        }
        if (from.getId().equals(to.getId())) {
            return quantity;
        }
        if (from.getBaseUnit() == null || !from.getBaseUnit().equals(to.getBaseUnit())
                || from.getBaseConversionFactor() == null || to.getBaseConversionFactor() == null) {
            return null;
        }
        BigDecimal quantityInBaseUnit = quantity.multiply(from.getBaseConversionFactor());
        return quantityInBaseUnit.divide(to.getBaseConversionFactor(), 6, RoundingMode.HALF_UP);
    }
}
