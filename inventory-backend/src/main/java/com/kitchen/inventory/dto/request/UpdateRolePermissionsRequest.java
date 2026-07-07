package com.kitchen.inventory.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class UpdateRolePermissionsRequest {

    @NotNull(message = "Permission IDs are required")
    private Set<UUID> permissionIds;
}
