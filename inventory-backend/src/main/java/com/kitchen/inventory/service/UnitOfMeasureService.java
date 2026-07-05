package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.request.UnitOfMeasureRequest;
import com.kitchen.inventory.entity.UnitOfMeasure;

import java.util.List;
import java.util.UUID;

public interface UnitOfMeasureService {
    List<UnitOfMeasure> getAllUnitsOfMeasure();
    UnitOfMeasure getUnitOfMeasureById(UUID id);
    UnitOfMeasure createUnitOfMeasure(UnitOfMeasureRequest request);
    UnitOfMeasure updateUnitOfMeasure(UUID id, UnitOfMeasureRequest request);
    void deleteUnitOfMeasure(UUID id);
}
