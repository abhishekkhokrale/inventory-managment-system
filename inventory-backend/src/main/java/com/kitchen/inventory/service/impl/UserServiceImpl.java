package com.kitchen.inventory.service.impl;

import com.kitchen.inventory.dto.request.CreateUserRequest;
import com.kitchen.inventory.dto.request.UpdateUserRequest;
import com.kitchen.inventory.dto.response.UserResponse;
import com.kitchen.inventory.entity.Role;
import com.kitchen.inventory.entity.User;
import com.kitchen.inventory.enums.RoleName;
import com.kitchen.inventory.exception.BusinessException;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.RoleRepository;
import com.kitchen.inventory.repository.UserRepository;
import com.kitchen.inventory.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(String search, Pageable pageable) {
        Page<User> users = StringUtils.hasText(search)
                ? userRepository.findAllBySearch("%" + search.toLowerCase() + "%", pageable)
                : userRepository.findAll(pageable);
        return users.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        return toResponse(findUser(id));
    }

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username is already taken");
        }

        Set<Role> roles = resolveRoles(request.getRoles());

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .roles(roles)
                .verified(true)
                .build();
        user.setActive(request.isActive());

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = findUser(id);

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already in use");
        }
        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username is already taken");
        }

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPhone(request.getPhone());

        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(resolveRoles(request.getRoles()));
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void toggleUserStatus(UUID id) {
        User user = findUser(id);
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        User user = findUser(id);
        user.setActive(false);
        userRepository.save(user);
    }

    private User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        return roleNames.stream()
                .map(name -> {
                    try {
                        RoleName roleName = RoleName.valueOf(name);
                        return roleRepository.findByName(roleName)
                                .orElseThrow(() -> new BusinessException("Role not found: " + name));
                    } catch (IllegalArgumentException e) {
                        throw new BusinessException("Invalid role name: " + name);
                    }
                })
                .collect(Collectors.toSet());
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .roles(user.getRoles().stream()
                        .map(r -> UserResponse.RoleInfo.builder()
                                .id(r.getId())
                                .name(r.getName().name())
                                .build())
                        .collect(Collectors.toList()))
                .active(user.isActive())
                .verified(user.isVerified())
                .locked(user.isLocked())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
