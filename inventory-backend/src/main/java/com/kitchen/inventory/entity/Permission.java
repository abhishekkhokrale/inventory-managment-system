package com.kitchen.inventory.entity;

import com.kitchen.inventory.enums.PermissionName;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false, unique = true)
    private PermissionName name;

    @Column(name = "description")
    private String description;

    @Column(name = "module")
    private String module;
}
