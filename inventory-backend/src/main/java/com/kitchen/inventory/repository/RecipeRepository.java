package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, UUID> {

    Optional<Recipe> findByCode(String code);

    boolean existsByCode(String code);

    @Query(value = """
        SELECT r FROM Recipe r
        JOIN FETCH r.kitchen
        WHERE r.active = true
        AND (:kitchenId IS NULL OR r.kitchen.id = :kitchenId)
        AND (:search IS NULL OR LOWER(r.name) LIKE :search OR LOWER(r.code) LIKE :search)
        AND (:published IS NULL OR r.published = :published)
    """,
    countQuery = """
        SELECT COUNT(r) FROM Recipe r
        WHERE r.active = true
        AND (:kitchenId IS NULL OR r.kitchen.id = :kitchenId)
        AND (:search IS NULL OR LOWER(r.name) LIKE :search OR LOWER(r.code) LIKE :search)
        AND (:published IS NULL OR r.published = :published)
    """)
    Page<Recipe> searchRecipes(
        @Param("kitchenId") UUID kitchenId,
        @Param("search") String search,
        @Param("published") Boolean published,
        Pageable pageable
    );

    @Query("""
        SELECT DISTINCT r FROM Recipe r
        JOIN FETCH r.kitchen
        LEFT JOIN FETCH r.ingredients ri
        LEFT JOIN FETCH ri.ingredient
        LEFT JOIN FETCH ri.unitOfMeasure
        WHERE r.id = :id
    """)
    Optional<Recipe> findByIdWithDetails(@Param("id") UUID id);
}
