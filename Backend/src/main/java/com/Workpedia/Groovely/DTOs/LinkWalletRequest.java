package com.Workpedia.Groovely.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LinkWalletRequest(@NotBlank(message = "Google token required") String googleToken,
                                @NotBlank(message = "Wallet addr required") @Pattern(regexp = "^0x[a-fA-F0-9]{40}$", message = "Invalid Ethereum wallet address") String walletAddress,
                                @NotBlank(message = "Signature required") String signature) {
}
