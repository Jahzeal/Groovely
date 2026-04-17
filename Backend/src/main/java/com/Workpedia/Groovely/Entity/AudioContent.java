package com.Workpedia.Groovely.Entity;

import com.Workpedia.Groovely.DTOs.ContentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "audio_content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioContent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    @Column(name = "genre", length = 50)
    private String genre;

    // Comma-separated tags stored as string
    @Column(name = "tags")
    private String tags;

    // IPFS Content Identifier — permanent address of the file
    @Column(name = "ipfs_cid", unique = true)
    private String ipfsCid;

    @Column(name = "ipfs_url")
    private String ipfsUrl;

    // SHA-256 hash of the file — Proof of Creation
    @Column(name = "sha256_hash", unique = true)
    private String sha256Hash;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "mime_type", length = 50)
    private String mimeType;

    @Column(name = "original_filename")
    private String originalFilename;

    // Wallet address of the creator
    @Column(name = "creator_wallet", nullable = false, length = 42)
    private String creatorWallet;

    @Column(name = "is_explicit", nullable = false)
    @Builder.Default
    private boolean explicit = false;

    @Column(name = "is_minted", nullable = false)
    @Builder.Default
    private boolean minted = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "play_count", nullable = false)
    @Builder.Default
    private Long playCount = 0L;

    @Column(name = "nft_token_id")
    private String nftTokenId;

    @Column(name = "contract_address")
    private String contractAddress;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
