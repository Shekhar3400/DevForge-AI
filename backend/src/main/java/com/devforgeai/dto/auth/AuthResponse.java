package com.devforgeai.dto.auth;

import com.devforgeai.entity.AuthProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Returned by both LOCAL login and Google OAuth2.
 * Same JWT format regardless of provider.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String       token;
    private String       email;
    private String       name;
    private String       pictureUrl;   // null for LOCAL users without a picture
    private AuthProvider provider;     // LOCAL | GOOGLE | GITHUB | MICROSOFT
}
