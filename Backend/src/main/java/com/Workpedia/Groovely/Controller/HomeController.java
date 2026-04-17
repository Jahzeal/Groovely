package com.Workpedia.Groovely.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HomeController {

    @Value("${groovely.frontend.url}")
    private String frontendUrl;

    @GetMapping("/")
    @ResponseBody
    public String home() {
        return """
            <html>
            <head><title>Groovely API</title></head>
            <body>
                <h1>🎵 Groovely API Server</h1>
                <p>Welcome to the Groovely Platform Backend!</p>
                <ul>
                    <li><a href="/swagger-ui">📚 API Documentation (Swagger UI)</a></li>
                    <li><a href="/api-docs">📋 OpenAPI Specification</a></li>
                    <li><a href="%s">🌐 Frontend Application</a></li>
                </ul>
                <p><strong>API Base URL:</strong> <code>/api/auth</code></p>
            </body>
            </html>
            """.formatted(frontendUrl);
    }

    @GetMapping("/health")
    @ResponseBody
    public String health() {
        return "OK";
    }
}