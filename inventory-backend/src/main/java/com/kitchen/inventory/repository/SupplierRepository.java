package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    Optional<Supplier> findByCode(String code);

    boolean existsByCode(String code);

    @Query("""
        SELECT s FROM Supplier s
        WHERE s.active = true
        AND (:search IS NULL OR LOWER(s.name) LIKE :search
             OR LOWER(s.code) LIKE :search
             OR LOWER(s.contactPerson) LIKE :search)
    """)
    Page<Supplier> searchSuppliers(@Param("search") String search, Pageable pageable);
}
