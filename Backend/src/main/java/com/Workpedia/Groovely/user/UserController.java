package com.Workpedia.Groovely.user;

import com.Workpedia.Groovely.DTOs.UpdateProfileRequest;
import com.Workpedia.Groovely.DTOs.UserProfileDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{walletAddress}")
    public ResponseEntity<UserProfileDto> getProfile(@PathVariable String walletAddress){
        return ResponseEntity.ok(userService.getProfile(walletAddress));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMyProfile(@AuthenticationPrincipal String walletAddress){
        return ResponseEntity.ok(userService.getProfile(walletAddress));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateMyProfile(@AuthenticationPrincipal String walletAddress, @Valid @RequestBody UpdateProfileRequest request){
        return ResponseEntity.ok(userService.updateProfile(walletAddress, request));
    }
}