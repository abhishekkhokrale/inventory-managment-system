package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.Kitchen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface KitchenRepository extends JpaRepository<Kitchen, UUID> {
    Optional<Kitchen> findByCode(String code);
    boolean existsByCode(String code);
}
