package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Supplier;
import com.kitchen.inventory.exception.DuplicateResourceException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.SupplierRepository;
import com.kitchen.inventory.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<Supplier> getSuppliers(String search, Pageable pageable) {
        String searchParam = search.isEmpty() ? null : "%" + search.toLowerCase() + "%";
        return PagedResponse.from(supplierRepository.searchSuppliers(searchParam, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public Supplier getSupplierById(UUID id) {
        return supplierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
    }

    @Override
    @Transactional
    public Supplier createSupplier(Supplier supplier) {
        if (supplierRepository.existsByCode(supplier.getCode())) {
            throw new DuplicateResourceException("Supplier", "code", supplier.getCode());
        }
        return supplierRepository.save(supplier);
    }

    @Override
    @Transactional
    public Supplier updateSupplier(UUID id, Supplier updated) {
        Supplier supplier = getSupplierById(id);
        supplier.setName(updated.getName());
        supplier.setContactPerson(updated.getContactPerson());
        supplier.setEmail(updated.getEmail());
        supplier.setPhone(updated.getPhone());
        supplier.setAddress(updated.getAddress());
        supplier.setCity(updated.getCity());
        supplier.setCountry(updated.getCountry());
        supplier.setPaymentTerms(updated.getPaymentTerms());
        supplier.setLeadTimeDays(updated.getLeadTimeDays());
        supplier.setRating(updated.getRating());
        supplier.setNotes(updated.getNotes());
        return supplierRepository.save(supplier);
    }

    @Override
    @Transactional
    public void deleteSupplier(UUID id) {
        Supplier supplier = getSupplierById(id);
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }
}
