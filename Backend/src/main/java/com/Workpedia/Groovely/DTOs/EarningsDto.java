package com.Workpedia.Groovely.DTOs;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EarningsDto {
    private String walletAddress;
    private long totalUploads;
    private long totalPlays;
    private String totalEarnings;
    private String currency;
    private String note;
}
