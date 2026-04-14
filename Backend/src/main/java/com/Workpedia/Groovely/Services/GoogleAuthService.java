package com.Workpedia.Groovely.Services;

import com.Workpedia.Groovely.DTOs.AuthResponse;
import com.Workpedia.Groovely.DTOs.GoogleAuthResponse;
import com.Workpedia.Groovely.Entity.GoogleAccount;
import com.Workpedia.Groovely.Repositories.GoogleAccountRepository;
import com.Workpedia.Groovely.auth.AuthService;
import com.Workpedia.Groovely.auth.WalletNonceRepository;
import com.Workpedia.Groovely.config.JwtUtil;
import com.Workpedia.Groovely.exception.AuthException;
import com.Workpedia.Groovely.user.User;
import com.Workpedia.Groovely.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthService {
    private final GoogleAccountRepository googleAccountRepository;
    private final UserRepository userRepository;
    private final WalletNonceRepository walletNonceRepository;
    private final AuthService authService;
    private final JwtUtil  jwtUtil;
@Value("${groovely.auth.google-token-expiry}")

    private long googleTokenExpiryMs;
    private final Map<String,String> pendingLinkToken = new ConcurrentHashMap<>();
    /**
     * Called after Google OAuth2 callback succeeds.
     * Either issues a JWT (if wallet already linked) or returns WALLET_REQUIRED.
     **/

    @Transactional
    public GoogleAuthResponse handleGoogleLogin(OAuth2User oAuth2User){
        String googleId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String displayName = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("picture");

        GoogleAccount googleAccount = googleAccountRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    GoogleAccount newAccount = GoogleAccount.builder()
                            .googleId(googleId)
                            .email(email)
                            .displayName(displayName)
                            .avatarUrl(avatarUrl)
                            .build();
                    return googleAccountRepository.save(newAccount);

                });

        googleAccount.setDisplayName(displayName);
        googleAccount.setAvatarUrl(avatarUrl);
        googleAccountRepository.save(googleAccount);

        if (googleAccount.getUser() == null) {
            log.info("Creating new User for Google account: {}", email);
            User newUser = User.builder()
                    .displayName(displayName)
                    .avatarUrl(avatarUrl)
                    .creatorType(User.CreatorType.FAN)
                    .active(true)
                    .verified(false)
                    .build();
            User savedUser = userRepository.save(newUser);
            googleAccount.setUser(savedUser);
            googleAccountRepository.save(googleAccount);
        }

        User user = googleAccount.getUser();
        String token = jwtUtil.generateToken(user.getId());
        boolean isNewUser = googleAccount.getCreatedAt() != null && 
                           googleAccount.getCreatedAt().isAfter(java.time.LocalDateTime.now().minusSeconds(10));

        log.info("Google user {} authenticated successfully", email);

        return GoogleAuthResponse.builder()
                .status("AUTHENTICATED")
                .token(token)
                .walletAddress(user.getWalletAddress())
                .userId(user.getId())
                .isNewUser(isNewUser)
                .email(email)
                .displayName(displayName)
                .build();
    }

    @Transactional
    public AuthResponse linkWallet(String googletoken, String walletAddress, String signature){

        String googleAccountid = pendingLinkToken.get(googletoken);
        if(googleAccountid == null){
            throw new AuthException("invalid or expired token , signin with google again");
        }
        GoogleAccount googleAccount = googleAccountRepository.findById(googleAccountid)
                .orElseThrow(()-> new AuthException("Account not found"));

        String nonce = authService.generateNonce(walletAddress);

        AuthResponse authResponse = authService.verifyAndLogin(walletAddress, signature);

        User user = userRepository.findByWalletAddress(walletAddress.toLowerCase())
                .orElseThrow(()-> new AuthException("User not found"));

        if (user.getAvatarUrl() == null && googleAccount.getAvatarUrl() !=null){
            user.setAvatarUrl(googleAccount.getAvatarUrl());
            userRepository.save(user);
        }

        googleAccount.setUser(user);
        googleAccountRepository.save(googleAccount);

        pendingLinkToken.remove(googletoken);

        log.info("Wallet has been linked");

        return authResponse;
    }
}
