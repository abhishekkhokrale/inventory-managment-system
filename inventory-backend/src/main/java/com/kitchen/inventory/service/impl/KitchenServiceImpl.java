package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.dto.request.KitchenRequest;
import com.kitchen.inventory.entity.Kitchen;
import com.kitchen.inventory.exception.DuplicateResourceException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.KitchenRepository;
import com.kitchen.inventory.service.KitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KitchenServiceImpl implements KitchenService {

    private final KitchenRepository kitchenRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Kitchen> getAllKitchens() {
        return kitchenRepository.findAll().stream()
            .filter(Kitchen::isActive)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Kitchen getKitchenById(UUID id) {
        return kitchenRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Kitchen", "id", id));
    }

    @Override
    @Transactional
    public Kitchen createKitchen(KitchenRequest request) {
        if (kitchenRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Kitchen", "code", request.getCode());
        }

        Kitchen kitchen = Kitchen.builder()
            .name(request.getName())
            .code(request.getCode())
            .location(request.getLocation())
            .contactEmail(request.getContactEmail())
            .contactPhone(request.getContactPhone())
            .description(request.getDescription())
            .build();
        kitchen.setActive(true);

        return kitchenRepository.save(kitchen);
    }

    @Override
    @Transactional
    public Kitchen updateKitchen(UUID id, KitchenRequest request) {
        Kitchen kitchen = getKitchenById(id);

        if (!kitchen.getCode().equals(request.getCode()) && kitchenRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Kitchen", "code", request.getCode());
        }

        kitchen.setName(request.getName());
        kitchen.setCode(request.getCode());
        kitchen.setLocation(request.getLocation());
        kitchen.setContactEmail(request.getContactEmail());
        kitchen.setContactPhone(request.getContactPhone());
        kitchen.setDescription(request.getDescription());

        return kitchenRepository.save(kitchen);
    }

    @Override
    @Transactional
    public void deleteKitchen(UUID id) {
        Kitchen kitchen = getKitchenById(id);
        kitchen.setActive(false);
        kitchenRepository.save(kitchen);
    }
}
