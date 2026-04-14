package com.Workpedia.Groovely.auth;

import com.Workpedia.Groovely.DTOs.AuthResponse;
import com.Workpedia.Groovely.config.JwtUtil;
import com.Workpedia.Groovely.exception.AuthException;
import com.Workpedia.Groovely.user.User;
import com.Workpedia.Groovely.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final WalletNonceRepository nonceRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${groovely.auth.nonce-expiry}")
    private long nonceExpiryMs;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

//    Generate a fresh nonce for the wallet.
    @Transactional
    public String generateNonce(String walletAddress) {
        String address = walletAddress.toLowerCase();

        // Invalidate any previous nonce
        nonceRepository
                .findTopByWalletAddressAndUsedFalseOrderByCreatedAtDesc(address)
                .ifPresent(old -> { old.setUsed(true); nonceRepository.save(old); });

        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String nonce = HexFormat.of().formatHex(randomBytes);

        nonceRepository.save(WalletNonce.builder()
                .walletAddress(address)
                .nonce(nonce)
                .expiresAt(LocalDateTime.now().plusNanos(nonceExpiryMs * 1_000_000L))
                .build());

        log.info("Nonce generated for wallet: {}", address);
        return nonce;
    }

//    Step 2 — Verify the signed nonce, issue a JWT.Creates a new user profile on first login automatically
    @Transactional
    public AuthResponse verifyAndLogin(String walletAddress, String signature) {
        String address = walletAddress.toLowerCase();

        WalletNonce walletNonce = nonceRepository
                .findTopByWalletAddressAndUsedFalseOrderByCreatedAtDesc(address)
                .orElseThrow(() -> new AuthException("No active nonce found. Request a new one."));

        if (!walletNonce.isValid()) {
            throw new AuthException("Nonce expired or already used. Request a new one.");
        }

        String message = buildSignMessage(walletNonce.getNonce());
        if (!verifyEthereumSignature(address, message, signature)) {
            throw new AuthException("Signature verification failed.");
        }

        // Consume nonce — prevents replay attacks
        walletNonce.setUsed(true);
        nonceRepository.save(walletNonce);

        boolean isNewUser = !userRepository.existsByWalletAddress(address);
        User user = userRepository.findByWalletAddress(address)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .walletAddress(address)
                                .creatorType(User.CreatorType.FAN)
                                .build()
                ));

        log.info("Wallet {} authenticated. New user: {}", address, isNewUser);
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(user.getId()))
                .walletAddress(address)
                .userId(user.getId())
                .isNewUser(isNewUser)
                .build();
    }

//    Human-readable EIP-191 message shown inside the MetaMask popup.

    public String buildSignMessage(String nonce) {
        return "Welcome to Groovely!\n\n" +
                "Sign this message to verify wallet ownership.\n" +
                "No gas fees. No blockchain transaction.\n\n" +
                "Nonce: " + nonce;
    }

//    Recovers the signer address from a personal_sign (EIP-191) signature and compares it to the claimed wallet address.

    private boolean verifyEthereumSignature(String walletAddress, String message, String signature) {
        try {
            byte[] msgBytes = message.getBytes(StandardCharsets.UTF_8);
            String prefix = "\u0019Ethereum Signed Message:\n" + msgBytes.length;
            byte[] prefixBytes = prefix.getBytes(StandardCharsets.UTF_8);

            byte[] combined = new byte[prefixBytes.length + msgBytes.length];
            System.arraycopy(prefixBytes, 0, combined, 0, prefixBytes.length);
            System.arraycopy(msgBytes, 0, combined, prefixBytes.length, msgBytes.length);

            byte[] hash = org.web3j.crypto.Hash.sha3(combined);
            byte[] sigBytes = Numeric.hexStringToByteArray(signature);

            if (sigBytes.length != 65) return false;

            byte v = sigBytes[64];
            if (v < 27) v += 27;

            Sign.SignatureData sigData = new Sign.SignatureData(
                    v,
                    Arrays.copyOfRange(sigBytes, 0, 32),
                    Arrays.copyOfRange(sigBytes, 32, 64)
            );

            BigInteger recoveredKey = Sign.signedMessageHashToKey(hash, sigData);
            String recoveredAddress = "0x" + Keys.getAddress(recoveredKey);

            return recoveredAddress.equalsIgnoreCase(walletAddress);

        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }

    /** Purge expired nonces every 10 minutes */
    @Scheduled(fixedRate = 600_000)
    @Transactional
    public void cleanupExpiredNonces() {
        nonceRepository.deleteExpiredNonces(LocalDateTime.now());
        log.debug("Expired nonces purged");
    }
}