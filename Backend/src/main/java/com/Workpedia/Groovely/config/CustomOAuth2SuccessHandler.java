package com.Workpedia.Groovely.config;

import com.Workpedia.Groovely.DTOs.GoogleAuthResponse;
import com.Workpedia.Groovely.Services.GoogleAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final GoogleAuthService googleAuthService;

    @Value("${groovely.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        if (response.isCommitted()) {
            return;
        }

        try {
            log.info("OAuth2 login successful. Processing user details...");
            
            String finalFrontendUrl = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl : "http://localhost:3000";
            log.debug("Using frontend URL: {}", finalFrontendUrl);

            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            log.debug("Google User Attributes: {}", oAuth2User.getAttributes());

            GoogleAuthResponse authResponse = googleAuthService.handleGoogleLogin(oAuth2User);
            log.info("Handled Google login for email: {}. Status: {}", authResponse.getEmail(), authResponse.getStatus());

            String targetUrl = UriComponentsBuilder.fromUriString(finalFrontendUrl + "/auth/callback")
                    .queryParam("status", authResponse.getStatus())
                    .queryParam("token", authResponse.getToken())
                    .queryParam("walletAddress", authResponse.getWalletAddress())
                    .queryParam("userId", authResponse.getUserId())
                    .queryParam("isNewUser", authResponse.isNewUser())
                    .queryParam("email", authResponse.getEmail())
                    .queryParam("displayName", authResponse.getDisplayName())
                    .build().toUriString();

            log.debug("Redirecting to: {}", targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } catch (Exception e) {
            log.error("Error in CustomOAuth2SuccessHandler: {}", e.getMessage(), e);
            // Redirect to frontend error page instead of showing Whitelabel 500
            String errorUrl = (frontendUrl != null && !frontendUrl.isBlank() ? frontendUrl : "http://localhost:3000") + "/auth/error?message=" + e.getMessage();
            getRedirectStrategy().sendRedirect(request, response, errorUrl);
        }
    }
}
