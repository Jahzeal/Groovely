package com.Workpedia.Groovely.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI groovelyOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Groovely Api")
                        .description("Backend API Reference\\n\\n\" +\n" +
                                "                                \"**Authentication:**\\n\" +\n" +
                                "                                \"1. Call `GET /api/auth/nonce/{walletAddress}` to get a nonce\\n\" +\n" +
                                "                                \"2. Sign the message with your wallet (MetaMask/WalletConnect/Phantom)\\n\" +\n" +
                                "                                \"3. Call `POST /api/auth/wallet/connect` to get a JWT token\\n\" +\n" +
                                "                                \"4. Click **Authorize** below and enter: `Bearer <your-token>`")
                        .version("0.5")
                        .contact(new Contact()
                                .name("Groovely")
                                .email("dev@groovely.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development"),
                        new Server().url("https://api.groovely.io").description("Production")
                ))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Auth", new SecurityScheme()
                                .name("Bearer Auth")
                                .type(SecurityScheme.Type.HTTP).scheme("Bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT token. Get it from POST /api/auth/wallet/connect")
                        )
                );
    }
}
