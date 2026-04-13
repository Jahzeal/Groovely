package com.Workpedia.Groovely.DTOs;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthResponse {
    private String status;

    private String token;
    private String walletAddress;
    private String userId;
    private boolean isNewUser;

    private String googleToken;
    private String email;
    private String displayName;
}
