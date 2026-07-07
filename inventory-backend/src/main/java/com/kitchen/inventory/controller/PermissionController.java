package com.kitchen.inventory.controller;

import com.kitchen.inventory.entity.Permission;
import com.kitchen.inventory.repository.PermissionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@Tag(name = "Permissions", description = "Permission lookup APIs (Super Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class PermissionController {

    private final PermissionRepository permissionRepository;

    @GetMapping
    @Operation(summary = "List all active permissions")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll().stream()
            .filter(Permission::isActive)
            .toList();
        return ResponseEntity.ok(permissions);
    }
}
