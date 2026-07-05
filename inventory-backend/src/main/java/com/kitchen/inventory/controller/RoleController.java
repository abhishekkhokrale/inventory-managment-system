package com.kitchen.inventory.controller;

import com.kitchen.inventory.entity.Role;
import com.kitchen.inventory.repository.RoleRepository;
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
@RequestMapping("/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Role lookup APIs")
@SecurityRequirement(name = "bearerAuth")
public class RoleController {

    private final RoleRepository roleRepository;

    @GetMapping
    @Operation(summary = "List all active roles")
    @PreAuthorize("hasAnyAuthority('USER_READ', 'USER_CREATE', 'USER_UPDATE')")
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleRepository.findAll().stream()
            .filter(Role::isActive)
            .toList();
        return ResponseEntity.ok(roles);
    }
}
