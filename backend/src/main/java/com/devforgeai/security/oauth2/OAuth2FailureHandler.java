package com.devforgeai.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Called when Google OAuth2 fails (user cancels, token invalid, etc.)
 * Redirects to the frontend error page with a descriptive message.
 */
@Slf4j
@Component
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.oauth2.failure-uri:http://localhost:5173/oauth2/error}")
    private String failureUri;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {

        log.warn("[OAuth2FailureHandler] OAuth2 login failed: {}", exception.getMessage());

        String message = URLEncoder.encode(
                exception.getMessage() != null
                        ? exception.getMessage()
                        : "Google login failed. Please try again.",
                StandardCharsets.UTF_8
        );

        getRedirectStrategy().sendRedirect(
                request, response,
                failureUri + "?error=" + message
        );
    }
}
