package com.Workpedia.Groovely.Services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
public class PinataService {

    @Value("${groovely.pinata.jwt}")
    private String pinataJwt;

    @Value("${groovely.pinata.gateway}")
    private String pinataGateway;

    private static final String PINATA_PIN_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    private static final String PINATA_UNPIN_URL = "https://api.pinata.cloud/pinning/unpin/";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Pins an audio file to IPFS via Pinata.
     * Returns the CID (Content Identifier) of the pinned file.
     */
    public PinataResponse pinFile(MultipartFile file, String fileName) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(pinataJwt);

        // Build multipart body
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // Add the file
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };
        body.add("file", fileResource);

        // Add metadata (shows up in Pinata dashboard)
        String pinataMetadata = String.format(
                "{\"name\": \"%s\", \"keyvalues\": {\"platform\": \"Groovely\"}}",
                fileName
        );
        body.add("pinataMetadata", pinataMetadata);

        // Pin options
        body.add("pinataOptions", "{\"cidVersion\": 1}");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    PINATA_PIN_URL, requestEntity, Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String cid = (String) response.getBody().get("IpfsHash");
                String gatewayUrl = pinataGateway + cid;
                log.info("File pinned to IPFS successfully. CID: {}", cid);
                return new PinataResponse(cid, gatewayUrl);
            }

            throw new RuntimeException("Failed to pin file to IPFS — empty response from Pinata");

        } catch (Exception e) {
            log.error("Pinata upload failed: {}", e.getMessage());
            throw new RuntimeException("Failed to upload to IPFS: " + e.getMessage());
        }
    }

    /**
     * Unpins a file from IPFS (used when content is deleted).
     */
    public void unpinFile(String cid) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(pinataJwt);
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(
                    PINATA_UNPIN_URL + cid,
                    HttpMethod.DELETE,
                    requestEntity,
                    Void.class
            );
            log.info("File unpinned from IPFS. CID: {}", cid);
        } catch (Exception e) {
            log.warn("Failed to unpin file from IPFS (CID: {}): {}", cid, e.getMessage());
        }
    }

    public String getGatewayUrl(String cid) {
        return pinataGateway + cid;
    }

    public record PinataResponse(String cid, String gatewayUrl) {}
}
