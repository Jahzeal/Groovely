package com.Workpedia.Groovely.auth;

import com.Workpedia.Groovely.Repositories.GoogleAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth/diagnostic")
@RequiredArgsConstructor
public class DiagnosticController {

    private final GoogleAccountRepository googleAccountRepository;
    private final Environment env;

    @Value("${groovely.frontend.url:NOT_SET}")
    private String frontendUrl;

    @GetMapping
    public Map<String, Object> runDiagnostic() {
        Map<String, Object> report = new HashMap<>();
        
        // 1. Database Check
        try {
            long count = googleAccountRepository.count();
            report.put("databaseConnection", "OK");
            report.put("googleAccountsCount", count);
        } catch (Exception e) {
            report.put("databaseConnection", "FAILED: " + e.getMessage());
        }

        // 2. Environment Variables Check (Masked)
        report.put("GOOGLE_CLIENT_ID_SET", env.containsProperty("spring.security.oauth2.client.registration.google.client-id"));
        report.put("GOOGLE_CLIENT_SECRET_SET", env.containsProperty("spring.security.oauth2.client.registration.google.client-secret"));
        report.put("JWT_SECRET_SET", env.containsProperty("groovely.jwt.secret"));
        report.put("FRONTEND_URL_VAL", frontendUrl);
        
        // 3. Profiles
        report.put("activeProfiles", env.getActiveProfiles());

        log.info("Diagnostic report generated");
        return report;
    }
}
