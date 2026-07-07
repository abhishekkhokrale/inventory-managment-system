package com.kitchen.inventory.service;

import com.kitchen.inventory.entity.Role;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface RoleService {
    List<Role> getAllRoles();
    Role updateRolePermissions(UUID roleId, Set<UUID> permissionIds);
}
