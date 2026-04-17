package com.Workpedia.Groovely.DTOs;

import com.Workpedia.Groovely.Entity.AudioContent;

import java.time.LocalDateTime;

public record AudioContentDto(
        String id,
        String title,
        String description,
        ContentType contentType,
        String genre,
        String tags,
        String ipfsCid,
        String ipfsUrl,
        String sha256Hash,
        Long fileSize,
        Integer durationSeconds,
        String mimeType,
        String creatorWallet,
        boolean explicit,
        boolean minted,
        Long playCount,
        String nftTokenId,
        String contractAddress,
        LocalDateTime uploadedAt
) {
    public static AudioContentDto from(AudioContent content) {
        return new AudioContentDto(
                content.getId(),
                content.getTitle(),
                content.getDescription(),
                content.getContentType(),
                content.getGenre(),
                content.getTags(),
                content.getIpfsCid(),
                content.getIpfsUrl(),
                content.getSha256Hash(),
                content.getFileSize(),
                content.getDurationSeconds(),
                content.getMimeType(),
                content.getCreatorWallet(),
                content.isExplicit(),
                content.isMinted(),
                content.getPlayCount(),
                content.getNftTokenId(),
                content.getContractAddress(),
                content.getUploadedAt()
        );
    }
}