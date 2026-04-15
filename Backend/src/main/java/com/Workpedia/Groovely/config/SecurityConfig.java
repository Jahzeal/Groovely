package com.Workpedia.Groovely.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        // Swagger UI
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-ui/index.html",
                                "/api-docs/**",
                                "/v3/api-docs/**",  // ← was missing
                                "/webjars/**"        // ← was missing
                        ).permitAll()
                        // Wallet auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // OAuth2
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        // Public
                        .requestMatchers("/api/marketplace/**").permitAll()
                        .requestMatchers("/api/content/*/preview").permitAll()
                        .requestMatchers("/api/users/{walletAddress}").permitAll()  // ← fixed closing }
                        // Everything else requires JWT
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(a -> a.baseUri("/oauth2/authorization"))
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(this.oauth2UserService())
                        )
                        .successHandler(customOAuth2SuccessHandler)
                        .failureHandler((request, response, exception) -> {
                            log.error("OAuth2 Login Failed: {}", exception.getMessage(), exception);
                            String error = exception.getMessage();
                            String finalFrontendUrl = (System.getenv("FRONTEND_URL") != null) ? System.getenv("FRONTEND_URL") : "https://grovely.io";
                            response.sendRedirect(finalFrontendUrl + "/auth/error?error=" + java.net.URLEncoder.encode(error, "UTF-8"));
                        })
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    private OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        return (userRequest) -> {
            log.info("Attempting to load user info from Google for registration: {}", 
                     userRequest.getClientRegistration().getRegistrationId());
            try {
                OAuth2User user = delegate.loadUser(userRequest);
                log.info("Successfully loaded user info for: {}", user.getAttribute("email"));
                return user;
            } catch (Exception e) {
                log.error("Failed to load user info from Google: {}", e.getMessage(), e);
                throw e;
            }
        };
    }
}