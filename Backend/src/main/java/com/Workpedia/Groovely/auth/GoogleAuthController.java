package com.Workpedia.Groovely.auth;

import com.Workpedia.Groovely.DTOs.AuthResponse;
import com.Workpedia.Groovely.DTOs.GoogleAuthResponse;
import com.Workpedia.Groovely.DTOs.LinkWalletRequest;
import com.Workpedia.Groovely.Services.GoogleAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequestMapping("/api/auth/google")
@RestController
@RequiredArgsConstructor
public class GoogleAuthController {
    private final GoogleAuthService googleAuthService;

    @GetMapping("/callback")
    public ResponseEntity<GoogleAuthResponse> googleCallBack(
            @AuthenticationPrincipal OAuth2User oAuth2User){
        GoogleAuthResponse response = googleAuthService.handleGoogleLogin(oAuth2User);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/link-wallet")
    public ResponseEntity<AuthResponse> linkWallet(
            @Valid @RequestBody LinkWalletRequest request){
        AuthResponse response = googleAuthService.linkWallet(
                request.googleToken(), request.walletAddress(), request.signature()
        );
        return ResponseEntity.ok(response);
    }


}
