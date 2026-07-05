package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.dto.request.WarehouseRequest;
import com.kitchen.inventory.entity.Kitchen;
import com.kitchen.inventory.entity.Warehouse;
import com.kitchen.inventory.exception.DuplicateResourceException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.KitchenRepository;
import com.kitchen.inventory.repository.WarehouseRepository;
import com.kitchen.inventory.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final KitchenRepository kitchenRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
            .filter(Warehouse::isActive)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Warehouse getWarehouseById(UUID id) {
        return warehouseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
    }

    @Override
    @Transactional
    public Warehouse createWarehouse(WarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Warehouse", "code", request.getCode());
        }
        Kitchen kitchen = kitchenRepository.findById(request.getKitchenId())
            .orElseThrow(() -> new ResourceNotFoundException("Kitchen", "id", request.getKitchenId()));

        Warehouse warehouse = Warehouse.builder()
            .name(request.getName())
            .code(request.getCode())
            .storageType(request.getStorageType())
            .location(request.getLocation())
            .capacity(request.getCapacity())
            .capacityUnit(request.getCapacityUnit())
            .temperatureMin(request.getTemperatureMin())
            .temperatureMax(request.getTemperatureMax())
            .kitchen(kitchen)
            .build();
        warehouse.setActive(true);

        return warehouseRepository.save(warehouse);
    }

    @Override
    @Transactional
    public Warehouse updateWarehouse(UUID id, WarehouseRequest request) {
        Warehouse warehouse = getWarehouseById(id);

        if (!warehouse.getCode().equals(request.getCode()) && warehouseRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Warehouse", "code", request.getCode());
        }
        Kitchen kitchen = kitchenRepository.findById(request.getKitchenId())
            .orElseThrow(() -> new ResourceNotFoundException("Kitchen", "id", request.getKitchenId()));

        warehouse.setName(request.getName());
        warehouse.setCode(request.getCode());
        warehouse.setStorageType(request.getStorageType());
        warehouse.setLocation(request.getLocation());
        warehouse.setCapacity(request.getCapacity());
        warehouse.setCapacityUnit(request.getCapacityUnit());
        warehouse.setTemperatureMin(request.getTemperatureMin());
        warehouse.setTemperatureMax(request.getTemperatureMax());
        warehouse.setKitchen(kitchen);

        return warehouseRepository.save(warehouse);
    }

    @Override
    @Transactional
    public void deleteWarehouse(UUID id) {
        Warehouse warehouse = getWarehouseById(id);
        warehouse.setActive(false);
        warehouseRepository.save(warehouse);
    }
}
