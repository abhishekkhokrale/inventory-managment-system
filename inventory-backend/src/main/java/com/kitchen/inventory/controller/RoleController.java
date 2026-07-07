package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.request.UpdateRolePermissionsRequest;
import com.kitchen.inventory.entity.Role;
import com.kitchen.inventory.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Role and role-permission management APIs")
@SecurityRequirement(name = "bearerAuth")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @Operation(summary = "List all active roles")
    @PreAuthorize("hasAnyAuthority('USER_READ', 'USER_CREATE', 'USER_UPDATE')")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @PutMapping("/{id}/permissions")
    @Operation(summary = "Replace a role's assigned permissions (Super Admin only)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Role> updateRolePermissions(@PathVariable UUID id,
                                                       @Valid @RequestBody UpdateRolePermissionsRequest request) {
        return ResponseEntity.ok(roleService.updateRolePermissions(id, request.getPermissionIds()));
    }
}
