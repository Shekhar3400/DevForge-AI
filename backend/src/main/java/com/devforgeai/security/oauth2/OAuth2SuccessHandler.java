package com.devforgeai.security.oauth2;

import com.devforgeai.dto.auth.AuthResponse;
import com.devforgeai.entity.User;
import com.devforgeai.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    public OAuth2SuccessHandler(@Lazy AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest  request,
            HttpServletResponse response,
            Authentication      authentication
    ) throws IOException {

        if (!(authentication.getPrincipal() instanceof OAuth2UserPrincipal principal)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        User user = principal.getUser();
        AuthResponse auth = authService.buildResponse(user);

        log.info("[OAuth2SuccessHandler] JWT issued for {} via {}",
                user.getEmail(), user.getProvider());

        String token    = auth.getToken();
        String name     = URLEncoder.encode(auth.getName()       != null ? auth.getName()       : "", StandardCharsets.UTF_8);
        String email    = URLEncoder.encode(auth.getEmail()      != null ? auth.getEmail()      : "", StandardCharsets.UTF_8);
        String provider = auth.getProvider() != null ? auth.getProvider().name() : "GOOGLE";
        String picture  = URLEncoder.encode(auth.getPictureUrl() != null ? auth.getPictureUrl() : "", StandardCharsets.UTF_8);

        // URL-encode the token too so dots/special chars are safe
        String tokenEnc = URLEncoder.encode(token, StandardCharsets.UTF_8);

        String targetUrl = redirectUri
                + "?token="    + tokenEnc
                + "&name="     + name
                + "&email="    + email
                + "&provider=" + provider
                + "&picture="  + picture;

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
