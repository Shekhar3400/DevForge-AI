package com.devforgeai.security;

import com.devforgeai.entity.User;
import com.devforgeai.exception.UnauthorizedException;
import com.devforgeai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Single place to extract the authenticated User from Spring Security context.
 * Never accept userId from the frontend — always derive from JWT.
 */
@Component
@RequiredArgsConstructor
public class SecurityHelper {

    private final UserRepository userRepository;

    /**
     * Returns the currently authenticated User entity.
     * Throws UnauthorizedException if no authentication is present.
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("Not authenticated");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + email));
    }

    /**
     * Returns the current user's ID.
     */
    public Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
