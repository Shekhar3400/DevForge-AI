package com.devforgeai.security;

import com.devforgeai.security.oauth2.CookieOAuth2AuthorizationRequestRepository;
import com.devforgeai.security.oauth2.OAuth2FailureHandler;
import com.devforgeai.security.oauth2.OAuth2SuccessHandler;
import com.devforgeai.security.oauth2.OAuth2UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter                   jwtAuthenticationFilter;
    private final OAuth2UserService                         oauth2UserService;
    private final OAuth2SuccessHandler                      oauth2SuccessHandler;
    private final OAuth2FailureHandler                      oauth2FailureHandler;
    private final CookieOAuth2AuthorizationRequestRepository cookieAuthRequestRepo;

    public SecurityConfig(
            JwtAuthenticationFilter                   jwtAuthenticationFilter,
            OAuth2UserService                         oauth2UserService,
            OAuth2SuccessHandler                      oauth2SuccessHandler,
            OAuth2FailureHandler                      oauth2FailureHandler,
            CookieOAuth2AuthorizationRequestRepository cookieAuthRequestRepo
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.oauth2UserService       = oauth2UserService;
        this.oauth2SuccessHandler    = oauth2SuccessHandler;
        this.oauth2FailureHandler    = oauth2FailureHandler;
        this.cookieAuthRequestRepo   = cookieAuthRequestRepo;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            org.springframework.security.config.annotation.web.builders.HttpSecurity http
    ) throws Exception {

        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .headers(headers -> headers
                .frameOptions(frame -> frame.disable())
                .xssProtection(xss -> xss.disable())
                .contentTypeOptions(cto -> {})
                .httpStrictTransportSecurity(hsts -> hsts
                        .includeSubDomains(true)
                        .maxAgeInSeconds(31536000))
            )
            // Session only needed during OAuth handshake — cookie repo handles the state
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(
                            "/api/auth/**",
                            "/oauth2/**",
                            "/login/oauth2/**",
                            "/swagger-ui/**",
                            "/v3/api-docs/**"
                    ).permitAll()
                    .requestMatchers(
                            "/", "/index.html", "/static/**", "/assets/**",
                            "/*.js", "/*.css", "/*.ico", "/*.png", "/*.svg"
                    ).permitAll()
                    .anyRequest().authenticated()
            )

            .oauth2Login(oauth2 -> oauth2
                    // Use cookie-based state storage — survives the Google redirect
                    .authorizationEndpoint(endpoint -> endpoint
                            .authorizationRequestRepository(cookieAuthRequestRepo)
                    )
                    .redirectionEndpoint(redir -> redir
                            .baseUri("/login/oauth2/code/*")
                    )
                    .userInfoEndpoint(userInfo ->
                            userInfo.userService(oauth2UserService))
                    .successHandler(oauth2SuccessHandler)
                    .failureHandler(oauth2FailureHandler)
            )

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("http://localhost:5173");
        config.addAllowedOriginPattern("http://localhost:8080");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}
