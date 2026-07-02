package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.Role;
import com.kitchen.inventory.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(RoleName name);
    boolean existsByName(RoleName name);
}
