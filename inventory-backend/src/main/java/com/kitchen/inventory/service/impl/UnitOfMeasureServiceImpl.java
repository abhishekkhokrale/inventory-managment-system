package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.dto.request.UnitOfMeasureRequest;
import com.kitchen.inventory.entity.UnitOfMeasure;
import com.kitchen.inventory.exception.DuplicateResourceException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.UnitOfMeasureRepository;
import com.kitchen.inventory.service.UnitOfMeasureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UnitOfMeasureServiceImpl implements UnitOfMeasureService {

    private final UnitOfMeasureRepository uomRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UnitOfMeasure> getAllUnitsOfMeasure() {
        return uomRepository.findAll().stream()
            .filter(UnitOfMeasure::isActive)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UnitOfMeasure getUnitOfMeasureById(UUID id) {
        return uomRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("UnitOfMeasure", "id", id));
    }

    @Override
    @Transactional
    public UnitOfMeasure createUnitOfMeasure(UnitOfMeasureRequest request) {
        if (uomRepository.findByAbbreviationIgnoreCase(request.getAbbreviation()).isPresent()) {
            throw new DuplicateResourceException("UnitOfMeasure", "abbreviation", request.getAbbreviation());
        }

        UnitOfMeasure uom = UnitOfMeasure.builder()
            .name(request.getName())
            .abbreviation(request.getAbbreviation())
            .type(request.getType())
            .baseConversionFactor(request.getBaseConversionFactor())
            .baseUnit(request.getBaseUnit())
            .build();
        uom.setActive(true);

        return uomRepository.save(uom);
    }

    @Override
    @Transactional
    public UnitOfMeasure updateUnitOfMeasure(UUID id, UnitOfMeasureRequest request) {
        UnitOfMeasure uom = getUnitOfMeasureById(id);

        boolean abbreviationChanged = !uom.getAbbreviation().equalsIgnoreCase(request.getAbbreviation());
        if (abbreviationChanged && uomRepository.findByAbbreviationIgnoreCase(request.getAbbreviation()).isPresent()) {
            throw new DuplicateResourceException("UnitOfMeasure", "abbreviation", request.getAbbreviation());
        }

        uom.setName(request.getName());
        uom.setAbbreviation(request.getAbbreviation());
        uom.setType(request.getType());
        uom.setBaseConversionFactor(request.getBaseConversionFactor());
        uom.setBaseUnit(request.getBaseUnit());

        return uomRepository.save(uom);
    }

    @Override
    @Transactional
    public void deleteUnitOfMeasure(UUID id) {
        UnitOfMeasure uom = getUnitOfMeasureById(id);
        uom.setActive(false);
        uomRepository.save(uom);
    }
}
