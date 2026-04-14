package com.Workpedia.Groovely.DTOs;

import com.Workpedia.Groovely.user.User;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        String displayName,
        @Size(min = 3, max = 50, message ="Username must be 3 - 50 characters")
        @Pattern(regexp = "^[a-zA-Z0-9_.-]*$", message = "Username may only contain letters, numbers, scores, dots, and hyphens")
        String username,

        @Size(max = 500, message = "Bio must not exceed 500 characters")
        String bio,

        User.CreatorType creatorType,

        String avatarUrl,
        String spotifyUrl,
        String soundcloudUrl,
        String twitterUrl,
        String instagramUrl
) {
}
