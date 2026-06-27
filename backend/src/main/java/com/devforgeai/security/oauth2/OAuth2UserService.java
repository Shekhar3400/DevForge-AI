package com.devforgeai.security.oauth2;

import com.devforgeai.entity.AuthProvider;
import com.devforgeai.entity.User;
import com.devforgeai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Invoked after Google returns the user's profile.
 * Finds the existing user or creates a new one automatically.
 * Account linking: if the email already exists as LOCAL, it merges.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request)
            throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(request);

        String registrationId = request.getClientRegistration().getRegistrationId();
        AuthProvider provider = resolveProvider(registrationId);

        return processOAuth2User(oAuth2User, provider);
    }

    // ── Extract attributes and find/create user ──────────────────────────────

    private OAuth2User processOAuth2User(OAuth2User oAuth2User, AuthProvider provider) {

        String email      = oAuth2User.getAttribute("email");
        String name       = oAuth2User.getAttribute("name");
        String pictureUrl = oAuth2User.getAttribute("picture");
        String providerId = oAuth2User.getAttribute("sub"); // Google's unique user ID

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not returned by OAuth2 provider");
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            // User exists — update OAuth fields and last login (account linking)
            user = existingUser.get();
            user.setProvider(provider);
            user.setProviderId(providerId);
            user.setPictureUrl(pictureUrl);
            user.setEmailVerified(true);
            user.setLastLogin(LocalDateTime.now());
            if (user.getName() == null || user.getName().isBlank()) {
                user.setName(name);
            }
            log.info("[OAuth2UserService] Linked existing account: {}", email);

        } else {
            // New user — auto-register with placeholder password (OAuth users never use it)
            user = User.builder()
                    .name(name)
                    .email(email)
                    .password("OAUTH2_NO_PASSWORD_" + java.util.UUID.randomUUID())
                    .provider(provider)
                    .providerId(providerId)
                    .pictureUrl(pictureUrl)
                    .emailVerified(true)
                    .lastLogin(LocalDateTime.now())
                    .build();
            log.info("[OAuth2UserService] Auto-registered new Google user: {}", email);
        }

        userRepository.save(user);

        // Wrap in our custom principal so downstream handlers can access the User entity
        return new OAuth2UserPrincipal(user, oAuth2User.getAttributes());
    }

    private AuthProvider resolveProvider(String registrationId) {
        return switch (registrationId.toLowerCase()) {
            case "google"    -> AuthProvider.GOOGLE;
            case "github"    -> AuthProvider.GITHUB;
            case "microsoft" -> AuthProvider.MICROSOFT;
            default          -> AuthProvider.GOOGLE;
        };
    }
}
