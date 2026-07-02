package com.kitchen.inventory.security;

import com.kitchen.inventory.entity.User;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrId) throws UsernameNotFoundException {
        User user;
        try {
            UUID id = UUID.fromString(usernameOrId);
            user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + usernameOrId));
        } catch (IllegalArgumentException e) {
            user = userRepository.findByUsernameOrEmail(usernameOrId, usernameOrId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + usernameOrId));
        }
        return UserPrincipal.create(user);
    }
}
