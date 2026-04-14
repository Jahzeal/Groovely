package com.Workpedia.Groovely.DTOs;

import com.Workpedia.Groovely.user.User;

import java.time.LocalDateTime;

public record UserProfileDto(
        String id,
        String walletAddress,
        String username,
        String displayName,
        String bio,
        User.CreatorType creatorType,
        String avatarUrl,
        String spotifyUrl,
        String soundcloudUrl,
        String twitterUrl,
        String instagramurl,
        boolean verified,
        LocalDateTime createdAt
) {
    public static UserProfileDto from(User user) {
        return new UserProfileDto(
                user.getId(),
                user.getWalletAddress(),
                user.getUsername(),
                user.getDisplayName(),
                user.getBio(),
                user.getCreatorType(),
                user.getAvatarUrl(),
                user.getSpotifyUrl(),
                user.getSoundcloudUrl(),
                user.getTwitterUrl(),
                user.getInstagramUrl(),
                user.isVerified(),
                user.getCreatedAt()
        );
    }
}
