package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.UnitOfMeasure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UnitOfMeasureRepository extends JpaRepository<UnitOfMeasure, UUID> {
    Optional<UnitOfMeasure> findByAbbreviation(String abbreviation);

    Optional<UnitOfMeasure> findByAbbreviationIgnoreCase(String abbreviation);
}
