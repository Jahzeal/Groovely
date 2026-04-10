package com.Workpedia.Groovely.user;

import com.Workpedia.Groovely.DTOs.UpdateProfileRequest;
import com.Workpedia.Groovely.DTOs.UserProfileDto;
import com.Workpedia.Groovely.exception.NotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserProfileDto getProfile(String walletAddress){
        return UserProfileDto.from(
                userRepository.findByWalletAddress(walletAddress.toLowerCase())
                        .orElseThrow(() -> new NotFoundException("User not found: " + walletAddress))
        );
    }

    @Transactional
    public UserProfileDto updateProfile(String walletAddress, UpdateProfileRequest req){
        User user = userRepository.findByWalletAddress(walletAddress.toLowerCase())
                .orElseThrow(() -> new NotFoundException("User not found: " + walletAddress));

        if (req.username() != null && !req.username().isBlank()){
            if (!req.username() .equals(user.getUsername())
                    && userRepository.existsByUsername(req.username())){
                throw new IllegalArgumentException("Username '" + req.username() + "' already exists");
            }
            user.setUsername(req.username());
        }

        if (req.bio() != null) user.setBio(req.bio());
        if (req.creatorType() != null) user.setCreatorType(req.creatorType());
        if (req.avatarUrl() != null)      user.setAvatarUrl(req.avatarUrl());
        if (req.spotifyUrl() != null)     user.setSpotifyUrl(req.spotifyUrl());
        if (req.soundcloudUrl() != null)  user.setSoundcloudUrl(req.soundcloudUrl());
        if (req.twitterUrl() != null)     user.setTwitterUrl(req.twitterUrl());
        if (req.instagramUrl() != null)   user.setInstagramUrl(req.instagramUrl());

        log.info("Profile updated for wallet : {}", walletAddress);
        return UserProfileDto.from(userRepository.save(user));
    }
}
