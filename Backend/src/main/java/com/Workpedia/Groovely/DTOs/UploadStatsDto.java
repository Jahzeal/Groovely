package com.Workpedia.Groovely.DTOs;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadStatsDto {
    private long totalUploads;
    private long mintedCount;
    private long unmintedCount;
    private long totalPlays;
    private Map<String, Long> contentBreakdown;
}