package com.Workpedia.Groovely.Services;


import com.Workpedia.Groovely.DTOs.AudioContentDto;
import com.Workpedia.Groovely.DTOs.ContentType;
import com.Workpedia.Groovely.Entity.AudioContent;
import com.Workpedia.Groovely.Repositories.AudioContentRepository;
import com.Workpedia.Groovely.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AudioContentService {

    private final AudioContentRepository contentRepository;
    private final PinataService pinataService;

    // Supported audio formats
    private static final Set<String> SUPPORTED_MIME_TYPES = Set.of(
            "audio/mpeg",       // MP3
            "audio/wav",        // WAV
            "audio/x-wav",      // WAV alternative
            "audio/flac",       // FLAC
            "audio/x-flac",     // FLAC alternative
            "audio/aac",        // AAC
            "audio/ogg",        // OGG
            "audio/mp4"         // M4A
    );

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    /**
     * Uploads audio file to IPFS and stores metadata in DB.
     */
    @Transactional
    public AudioContentDto uploadContent(
            MultipartFile file,
            String title,
            String description,
            ContentType contentType,
            String genre,
            String tags,
            boolean isExplicit,
            String creatorWallet) throws IOException {

        // Validate file
        validateFile(file);

        // Compute SHA-256 hash for Proof of Creation
        String sha256Hash = computeSha256(file.getBytes());

        // Check for duplicate uploads
        if (contentRepository.existsBySha256Hash(sha256Hash)) {
            throw new IllegalArgumentException(
                    "This file has already been uploaded. Duplicate content is not allowed."
            );
        }

        // Pin to IPFS via Pinata
        String sanitizedFileName = sanitizeFileName(file.getOriginalFilename());
        PinataService.PinataResponse pinataResponse = pinataService.pinFile(file, sanitizedFileName);

        // Save metadata to database
        AudioContent content = AudioContent.builder()
                .title(title)
                .description(description)
                .contentType(contentType)
                .genre(genre)
                .tags(tags)
                .ipfsCid(pinataResponse.cid())
                .ipfsUrl(pinataResponse.gatewayUrl())
                .sha256Hash(sha256Hash)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .originalFilename(sanitizedFileName)
                .creatorWallet(creatorWallet.toLowerCase())
                .explicit(isExplicit)
                .build();

        AudioContent saved = contentRepository.save(content);
        log.info("Content uploaded successfully. ID: {}, CID: {}", saved.getId(), saved.getIpfsCid());

        return AudioContentDto.from(saved);
    }

    /**
     * Get content metadata by ID. Increments play count.
     */
    @Transactional
    public AudioContentDto getContent(String contentId) {
        AudioContent content = contentRepository.findByIdAndActiveTrue(contentId)
                .orElseThrow(() -> new NotFoundException("Content not found: " + contentId));
        contentRepository.incrementPlayCount(contentId);
        return AudioContentDto.from(content);
    }

    /**
     * Get paginated list of content uploaded by a specific wallet.
     */
    public Page<AudioContentDto> getMyContent(String walletAddress, int page, int size, ContentType contentType) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadedAt").descending());

        Page<AudioContent> results;
        if (contentType != null) {
            results = contentRepository.findByActiveTrueAndContentType(contentType, pageable);
        } else {
            results = contentRepository.findByCreatorWalletAndActiveTrue(
                    walletAddress.toLowerCase(), pageable
            );
        }
        return results.map(AudioContentDto::from);
    }

    /**
     * Deletes content — only if not yet minted as NFT.
     */
    @Transactional
    public void deleteContent(String contentId, String walletAddress) {
        AudioContent content = contentRepository.findByIdAndActiveTrue(contentId)
                .orElseThrow(() -> new NotFoundException("Content not found: " + contentId));

        if (!content.getCreatorWallet().equalsIgnoreCase(walletAddress)) {
            throw new SecurityException("You are not the owner of this content.");
        }

        if (content.isMinted()) {
            throw new IllegalStateException(
                    "Cannot delete content that has been minted as an NFT."
            );
        }

        // Soft delete
        content.setActive(false);
        contentRepository.save(content);

        // Unpin from IPFS
        if (content.getIpfsCid() != null) {
            pinataService.unpinFile(content.getIpfsCid());
        }

        log.info("Content deleted. ID: {}", contentId);
    }

    /**
     * Get preview URL for a content item (30 second preview via IPFS).
     */
    public String getPreviewUrl(String contentId) {
        AudioContent content = contentRepository.findByIdAndActiveTrue(contentId)
                .orElseThrow(() -> new NotFoundException("Content not found: " + contentId));
        return content.getIpfsUrl();
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 50MB limit.");
        }
        String mimeType = file.getContentType();
        if (mimeType == null || !SUPPORTED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported file type: " + mimeType +
                            ". Supported formats: MP3, WAV, FLAC, AAC, OGG, M4A"
            );
        }
    }

    private String computeSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String sanitizeFileName(String originalFilename) {
        if (originalFilename == null) return "audio_file";
        return originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
