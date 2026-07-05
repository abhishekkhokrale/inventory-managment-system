package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.request.CategoryRequest;
import com.kitchen.inventory.entity.Category;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<Category> getAllCategories();
    Category getCategoryById(UUID id);
    Category createCategory(CategoryRequest request);
    Category updateCategory(UUID id, CategoryRequest request);
    void deleteCategory(UUID id);
}
