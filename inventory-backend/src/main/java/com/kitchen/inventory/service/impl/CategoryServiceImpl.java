package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.dto.request.CategoryRequest;
import com.kitchen.inventory.entity.Category;
import com.kitchen.inventory.exception.DuplicateResourceException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.CategoryRepository;
import com.kitchen.inventory.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findByParentIsNullAndActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Override
    @Transactional
    public Category createCategory(CategoryRequest request) {
        if (categoryRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Category", "code", request.getCode());
        }

        Category parent = resolveParent(request.getParentId());

        Category category = Category.builder()
            .name(request.getName())
            .code(request.getCode())
            .description(request.getDescription())
            .parent(parent)
            .build();
        category.setActive(true);

        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category updateCategory(UUID id, CategoryRequest request) {
        Category category = getCategoryById(id);

        if (!category.getCode().equals(request.getCode()) && categoryRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Category", "code", request.getCode());
        }

        category.setName(request.getName());
        category.setCode(request.getCode());
        category.setDescription(request.getDescription());
        category.setParent(resolveParent(request.getParentId()));

        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        Category category = getCategoryById(id);
        category.setActive(false);
        categoryRepository.save(category);
    }

    private Category resolveParent(UUID parentId) {
        if (parentId == null) {
            return null;
        }
        return categoryRepository.findById(parentId)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", parentId));
    }
}
