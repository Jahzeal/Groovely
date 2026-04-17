package com.Workpedia.Groovely.DTOs;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletBalanceDto {
    private String walletAddress;
    private String maticBalance;
    private String usdcBalance;
    private String network;
    private int chainId;
    private String error;
}
