package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Supplier;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface SupplierService {
    PagedResponse<Supplier> getSuppliers(String search, Pageable pageable);
    Supplier getSupplierById(UUID id);
    Supplier createSupplier(Supplier supplier);
    Supplier updateSupplier(UUID id, Supplier supplier);
    void deleteSupplier(UUID id);
}
