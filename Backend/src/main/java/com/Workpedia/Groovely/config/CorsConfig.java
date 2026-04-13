package com.Workpedia.Groovely.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {
    @Value("${groovely.cors.allowed-origins:http://localhost:3000}")
    private String allowedOriginsRaw;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Split comma-separated origins from properties
        List<String> origins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .toList();

        config.setAllowedOrigins(origins);

        // Allow all standard HTTP methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allow all headers including Authorization (for JWT)
        config.setAllowedHeaders(List.of("*"));

        // Expose Authorization header to frontend
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));

        // Allow credentials (cookies, auth headers)
        config.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply to all endpoints
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
