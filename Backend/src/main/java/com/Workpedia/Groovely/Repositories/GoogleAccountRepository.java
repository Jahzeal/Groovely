package com.Workpedia.Groovely.Repositories;

import com.Workpedia.Groovely.Entity.GoogleAccount;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoogleAccountRepository extends JpaRepository<GoogleAccount,String> {
    Optional<GoogleAccount> findByEmail(String email);

    Optional<GoogleAccount> findByGoogleId(String googleId);

    boolean existsByGoogleId(String googleId);
}
