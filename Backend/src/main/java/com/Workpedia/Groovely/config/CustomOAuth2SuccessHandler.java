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

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        GoogleAuthResponse authResponse = googleAuthService.handleGoogleLogin(oAuth2User);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/auth/callback")
                .queryParam("status", authResponse.getStatus())
                .queryParam("token", authResponse.getToken())
                .queryParam("walletAddress", authResponse.getWalletAddress())
                .queryParam("userId", authResponse.getUserId())
                .queryParam("isNewUser", authResponse.isNewUser())
                .queryParam("googleToken", authResponse.getGoogleToken())
                .queryParam("email", authResponse.getEmail())
                .queryParam("displayName", authResponse.getDisplayName())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
