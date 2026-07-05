package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {
    Optional<Warehouse> findByCode(String code);
    List<Warehouse> findByKitchenId(UUID kitchenId);
    boolean existsByCode(String code);

    @Query("SELECT w FROM Warehouse w JOIN FETCH w.kitchen WHERE w.active = true")
    List<Warehouse> findAllActiveWithKitchen();
}
