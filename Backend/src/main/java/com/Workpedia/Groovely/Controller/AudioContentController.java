package com.Workpedia.Groovely.Controller;

import com.Workpedia.Groovely.DTOs.AudioContentDto;
import com.Workpedia.Groovely.DTOs.ContentType;
import com.Workpedia.Groovely.Services.AudioContentService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;

@Slf4j
@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class AudioContentController {

    private final AudioContentService contentService;

    /**
     * POST /api/content/upload
     * Upload an audio file to IPFS and store metadata.
     * Accepts multipart/form-data.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AudioContentDto> uploadContent(
            @RequestPart("file") MultipartFile file,
            @RequestPart("title") @NotBlank String title,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart("contentType") @NotNull String contentType,
            @RequestPart(value = "genre", required = false) String genre,
            @RequestPart(value = "tags", required = false) String tags,
            @RequestPart(value = "isExplicit", required = false) String isExplicit,
            @AuthenticationPrincipal String walletAddress) throws IOException {

        AudioContentDto result = contentService.uploadContent(
                file,
                title,
                description,
                ContentType.valueOf(contentType.toUpperCase()),
                genre,
                tags,
                Boolean.parseBoolean(isExplicit),
                walletAddress
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * GET /api/content/{contentId}
     * Get full metadata for a content item. Public endpoint.
     * Also increments play count.
     */
    @GetMapping("/{contentId}")
    public ResponseEntity<AudioContentDto> getContent(@PathVariable String contentId) {
        return ResponseEntity.ok(contentService.getContent(contentId));
    }

    /**
     * GET /api/content/{contentId}/preview
     * Redirects to the IPFS gateway URL for streaming.
     * Public endpoint — no auth required.
     */
    @GetMapping("/{contentId}/preview")
    public ResponseEntity<Void> previewContent(@PathVariable String contentId) {
        String previewUrl = contentService.getPreviewUrl(contentId);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(previewUrl))
                .build();
    }

    /**
     * GET /api/content/my
     * Get all content uploaded by the authenticated user.
     */
    @GetMapping("/my")
    public ResponseEntity<Page<AudioContentDto>> getMyContent(
            @AuthenticationPrincipal String walletAddress,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ContentType contentType) {

        return ResponseEntity.ok(
                contentService.getMyContent(walletAddress, page, size, contentType)
        );
    }

    /**
     * DELETE /api/content/{contentId}
     * Delete uploaded content. Only allowed if not minted as NFT.
     */
    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable String contentId,
            @AuthenticationPrincipal String walletAddress) {

        contentService.deleteContent(contentId, walletAddress);
        return ResponseEntity.noContent().build();
    }
}