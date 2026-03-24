package com.Workpedia.Groovely.DTOs;

import lombok.*;
import org.springframework.web.bind.annotation.GetMapping;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String walletAddress;
    private String userId;
    private boolean isNewUser;
}
