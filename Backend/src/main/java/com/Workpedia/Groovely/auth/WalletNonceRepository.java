package com.Workpedia.Groovely.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface WalletNonceRepository extends JpaRepository<WalletNonce, String> {

    Optional<WalletNonce> findTopByWalletAddressAndUsedFalseOrderByCreatedAtDesc(String walletAddress);

    @Modifying
    @Query("DELETE FROM WalletNonce w WHERE w.expiresAt < :now")
    void deleteExpiredNonces(LocalDateTime now);

}
