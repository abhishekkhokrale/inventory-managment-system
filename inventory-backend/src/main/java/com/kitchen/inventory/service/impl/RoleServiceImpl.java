package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.entity.Permission;
import com.kitchen.inventory.entity.Role;
import com.kitchen.inventory.enums.RoleName;
import com.kitchen.inventory.exception.BusinessException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.PermissionRepository;
import com.kitchen.inventory.repository.RoleRepository;
import com.kitchen.inventory.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return roleRepository.findAll().stream()
            .filter(Role::isActive)
            .toList();
    }

    @Override
    @Transactional
    public Role updateRolePermissions(UUID roleId, Set<UUID> permissionIds) {
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        if (role.getName() == RoleName.SUPER_ADMIN) {
            throw new BusinessException("SUPER_ADMIN always has every permission and cannot be modified");
        }

        Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(permissionIds));
        if (permissions.size() != permissionIds.size()) {
            throw new BusinessException("One or more permission IDs do not exist");
        }

        role.setPermissions(permissions);
        return roleRepository.save(role);
    }
}
