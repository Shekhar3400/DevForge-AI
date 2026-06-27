package com.devforgeai.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Adds recommended security headers to every response.
 * Removes deprecated headers (X-XSS-Protection, X-Frame-Options, Pragma, Expires).
 * Adds X-Content-Type-Options, proper CSP with frame-ancestors.
 */
@Configuration
public class WebSecurityHeadersConfig {

    @Bean
    public Filter securityHeadersFilter() {
        return (ServletRequest req, ServletResponse res, FilterChain chain) -> {
            HttpServletResponse response = (HttpServletResponse) res;

            // Recommended security headers
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("Content-Security-Policy",
                    "default-src 'self'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
            response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

            // Remove deprecated / unneeded headers
            response.setHeader("X-XSS-Protection",  null);
            response.setHeader("X-Frame-Options",    null);
            response.setHeader("Pragma",             null);
            response.setHeader("Expires",            null);

            chain.doFilter(req, res);
        };
    }
}
