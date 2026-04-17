package com.Workpedia.Groovely.Repositories;


import com.Workpedia.Groovely.DTOs.ContentType;
import com.Workpedia.Groovely.Entity.AudioContent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AudioContentRepository extends JpaRepository<AudioContent, String> {

    Page<AudioContent> findByCreatorWalletAndActiveTrue(String creatorWallet, Pageable pageable);

    Optional<AudioContent> findByIdAndActiveTrue(String id);

    Optional<AudioContent> findBySha256Hash(String sha256Hash);

    boolean existsBySha256Hash(String sha256Hash);

    long countByCreatorWallet(String creatorWallet);

    long countByCreatorWalletAndMintedTrue(String creatorWallet);

    @Query("SELECT SUM(c.playCount) FROM AudioContent c WHERE c.creatorWallet = :creatorWallet")
    Long sumPlayCountByCreatorWallet(String creatorWallet);

    @Modifying
    @Query("UPDATE AudioContent c SET c.playCount = c.playCount + 1 WHERE c.id = :id")
    void incrementPlayCount(String id);

    Page<AudioContent> findByActiveTrueOrderByUploadedAtDesc(Pageable pageable);

    Page<AudioContent> findByActiveTrueAndContentType(ContentType contentType, Pageable pageable);
}