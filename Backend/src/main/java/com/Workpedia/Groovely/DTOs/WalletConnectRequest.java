package com.Workpedia.Groovely.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record WalletConnectRequest(
        @NotBlank(message = "wallet address is required")
        @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "invalid Ethereum Wallet Address")
        String walletAddress,

        @NotBlank(message = "Signature is required") String signature) {
}
