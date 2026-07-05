package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.request.WarehouseRequest;
import com.kitchen.inventory.entity.Warehouse;

import java.util.List;
import java.util.UUID;

public interface WarehouseService {
    List<Warehouse> getAllWarehouses();
    Warehouse getWarehouseById(UUID id);
    Warehouse createWarehouse(WarehouseRequest request);
    Warehouse updateWarehouse(UUID id, WarehouseRequest request);
    void deleteWarehouse(UUID id);
}
