package com.Workpedia.Groovely.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "wallet_address", unique = true, length = 42)
    private String walletAddress;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "username", unique = true, length = 50)
    private String username;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Enumerated
    @Column(name = "creator_type", nullable = false)
    private CreatorType creatorType;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "spotify_url")
    private String spotifyUrl;

    @Column(name = "soundcloud_url")
    private String soundcloudUrl;

    @Column(name = "twitter_url")
    private String twitterUrl;

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum CreatorType {
        ARTIST,
        PRODUCER,
        DJ,
        SKIT_MAKER,
        PODCASTER,
        FAN,
        OTHER
    }

}
