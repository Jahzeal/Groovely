package com.Workpedia.Groovely.auth;

import com.Workpedia.Groovely.DTOs.AuthResponse;
import com.Workpedia.Groovely.DTOs.NonceResponse;
import com.Workpedia.Groovely.DTOs.WalletConnectRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @GetMapping("/nonce/{walletAddress}")
    public ResponseEntity<NonceResponse> getNonce(
            @PathVariable
            @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "Invalid Ethereum wallet address")
            String walletAddress){
        String nonce = authService.generateNonce(walletAddress);
        String message = authService.buildSignMessage(nonce);

        return ResponseEntity.ok(new NonceResponse(nonce, message));
    }

    @PostMapping("wallet/connect")
    public ResponseEntity<AuthResponse> connectWallet(@Valid @RequestBody WalletConnectRequest request){
        return ResponseEntity.ok(authService.verifyAndLogin(request.walletAddress(), request.signature())
        );
    }

}
