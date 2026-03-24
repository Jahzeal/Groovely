package com.Workpedia.Groovely.auth;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_nonces")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletNonce {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String Id;

    @Column(name = "wallet_address",  nullable = false, length = 42)
    private String walletAddress;

    @Column(name = "nonce", nullable = false, length = 64)
    private String nonce;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used", nullable = false)
    @Builder.Default
    private boolean used = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid(){
        return !used && !isExpired();
    }
}
