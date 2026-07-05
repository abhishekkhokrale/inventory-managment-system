package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.request.KitchenRequest;
import com.kitchen.inventory.entity.Kitchen;

import java.util.List;
import java.util.UUID;

public interface KitchenService {
    List<Kitchen> getAllKitchens();
    Kitchen getKitchenById(UUID id);
    Kitchen createKitchen(KitchenRequest request);
    Kitchen updateKitchen(UUID id, KitchenRequest request);
    void deleteKitchen(UUID id);
}
