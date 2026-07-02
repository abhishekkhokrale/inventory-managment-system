package com.kitchen.inventory.service;

import com.kitchen.inventory.dto.request.CreateUserRequest;
import com.kitchen.inventory.dto.request.UpdateUserRequest;
import com.kitchen.inventory.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {
    Page<UserResponse> getAllUsers(String search, Pageable pageable);
    UserResponse getUserById(UUID id);
    UserResponse createUser(CreateUserRequest request);
    UserResponse updateUser(UUID id, UpdateUserRequest request);
    void toggleUserStatus(UUID id);
    void deleteUser(UUID id);
}
