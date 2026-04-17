package com.Workpedia.Groovely.Controller;

import com.Workpedia.Groovely.DTOs.EarningsDto;
import com.Workpedia.Groovely.DTOs.UploadStatsDto;
import com.Workpedia.Groovely.DTOs.WalletBalanceDto;
import com.Workpedia.Groovely.Services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/dashboard/earnings
     * Get earnings overview for the authenticated creator.
     */
    @GetMapping("/earnings")
    public ResponseEntity<EarningsDto> getEarnings(
            @AuthenticationPrincipal String walletAddress) {
        return ResponseEntity.ok(dashboardService.getEarnings(walletAddress));
    }

    /**
     * GET /api/dashboard/uploads
     * Get upload and play statistics.
     */
    @GetMapping("/uploads")
    public ResponseEntity<UploadStatsDto> getUploadStats(
            @AuthenticationPrincipal String walletAddress) {
        return ResponseEntity.ok(dashboardService.getUploadStats(walletAddress));
    }

    /**
     * GET /api/dashboard/wallet
     * Get on-chain wallet balance from Polygon via Alchemy.
     */
    @GetMapping("/wallet")
    public ResponseEntity<WalletBalanceDto> getWalletBalance(
            @AuthenticationPrincipal String walletAddress) {
        return ResponseEntity.ok(dashboardService.getWalletBalance(walletAddress));
    }
}