package com.Workpedia.Groovely.Services;


import com.Workpedia.Groovely.DTOs.EarningsDto;
import com.Workpedia.Groovely.DTOs.UploadStatsDto;
import com.Workpedia.Groovely.DTOs.WalletBalanceDto;
import com.Workpedia.Groovely.Entity.AudioContent;
import com.Workpedia.Groovely.Repositories.AudioContentRepository;
import com.Workpedia.Groovely.DTOs.ContentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AudioContentRepository contentRepository;

    @Value("${groovely.polygon.rpc-url}")
    private String polygonRpcUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Get earnings overview for a creator.
     * For Phase 1 — returns upload and play stats.
     * Full earnings tracking comes in Module 5 (Transactions).
     */
    public EarningsDto getEarnings(String walletAddress) {
        long totalUploads = contentRepository.countByCreatorWallet(walletAddress.toLowerCase());
        Long totalPlays = contentRepository.sumPlayCountByCreatorWallet(walletAddress.toLowerCase());

        return EarningsDto.builder()
                .walletAddress(walletAddress)
                .totalUploads(totalUploads)
                .totalPlays(totalPlays != null ? totalPlays : 0L)
                .totalEarnings("0.0")
                .currency("MATIC")
                .note("Full earnings tracking available in Phase 2 after transaction module is complete.")
                .build();
    }

    /**
     * Get upload statistics for a creator.
     */
    public UploadStatsDto getUploadStats(String walletAddress) {
        String normalizedWallet = walletAddress.toLowerCase();

        long totalUploads = contentRepository.countByCreatorWallet(normalizedWallet);
        long mintedCount = contentRepository.countByCreatorWalletAndMintedTrue(normalizedWallet);
        Long totalPlays = contentRepository.sumPlayCountByCreatorWallet(normalizedWallet);

        // Content type breakdown
        Map<String, Long> contentBreakdown = new HashMap<>();
        for (ContentType type : ContentType.values()) {
            long count = contentRepository
                    .findByCreatorWalletAndActiveTrue(normalizedWallet,
                            org.springframework.data.domain.Pageable.unpaged())
                    .stream()
                    .filter(c -> c.getContentType() == type)
                    .count();
            if (count > 0) contentBreakdown.put(type.name(), count);
        }

        return UploadStatsDto.builder()
                .totalUploads(totalUploads)
                .mintedCount(mintedCount)
                .unmintedCount(totalUploads - mintedCount)
                .totalPlays(totalPlays != null ? totalPlays : 0L)
                .contentBreakdown(contentBreakdown)
                .build();
    }

    /**
     * Get wallet balance from Polygon via Alchemy RPC.
     */
    public WalletBalanceDto getWalletBalance(String walletAddress) {
        try {
            // Call Polygon RPC to get MATIC balance
            Map<String, Object> requestBody = Map.of(
                    "jsonrpc", "2.0",
                    "method", "eth_getBalance",
                    "params", List.of(walletAddress, "latest"),
                    "id", 1
            );

            Map response = restTemplate.postForObject(polygonRpcUrl, requestBody, Map.class);

            String balanceHex = "0x0";
            if (response != null && response.get("result") != null) {
                balanceHex = (String) response.get("result");
            }

            // Convert hex balance (in Wei) to MATIC
            long balanceWei = Long.parseLong(balanceHex.substring(2), 16);
            double balanceMatic = balanceWei / 1e18;
            String balanceFormatted = String.format("%.4f", balanceMatic);

            return WalletBalanceDto.builder()
                    .walletAddress(walletAddress)
                    .maticBalance(balanceFormatted)
                    .usdcBalance("0.00")
                    .network("Polygon Amoy Testnet")
                    .chainId(80002)
                    .build();

        } catch (Exception e) {
            log.error("Failed to fetch wallet balance for {}: {}", walletAddress, e.getMessage());
            return WalletBalanceDto.builder()
                    .walletAddress(walletAddress)
                    .maticBalance("0.0000")
                    .usdcBalance("0.00")
                    .network("Polygon Amoy Testnet")
                    .chainId(80002)
                    .error("Could not fetch balance. Please try again.")
                    .build();
        }
    }
}
