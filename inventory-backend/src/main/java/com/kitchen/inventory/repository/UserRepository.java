package com.kitchen.inventory.repository;

import com.kitchen.inventory.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsernameOrEmail(String username, String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByPasswordResetToken(String token);

    Optional<User> findByRefreshToken(String refreshToken);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    @Query("""
        SELECT u FROM User u
        WHERE u.active = true
        AND (LOWER(u.firstName) LIKE :search
        OR LOWER(u.lastName) LIKE :search
        OR LOWER(u.email) LIKE :search
        OR LOWER(u.username) LIKE :search)
    """)
    Page<User> searchUsers(String search, Pageable pageable);

    @Query("""
        SELECT u FROM User u
        WHERE LOWER(u.firstName) LIKE :search
        OR LOWER(u.lastName) LIKE :search
        OR LOWER(u.email) LIKE :search
        OR LOWER(u.username) LIKE :search
    """)
    Page<User> findAllBySearch(String search, Pageable pageable);
}
