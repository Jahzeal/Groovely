package com.Workpedia.Groovely.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByWalletAddress(String walletAddress);
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByWalletAddress(String walletAddress);
}
