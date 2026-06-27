package com.devforgeai.entity;

/**
 * Identifies how the user authenticated.
 * LOCAL  = email + password
 * GOOGLE = Google OAuth2
 * Future: GITHUB, MICROSOFT
 */
public enum AuthProvider {
    LOCAL,
    GOOGLE,
    GITHUB,
    MICROSOFT
}
