package com.company.event.contestPackage.submission;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class JDoodleService {

    @Value("${jdoodle.client-id}")
    private String clientId;

    @Value("${jdoodle.client-secret}")
    private String clientSecret;

    @Value("${jdoodle.api-url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> executeCode(String sourceCode,
                                           String language,
                                           String versionIndex,
                                           String stdin) {

        Map<String, String> requestBody = Map.of(
                "clientId", clientId,
                "clientSecret", clientSecret,
                "script", sourceCode,
                "language", language,
                "versionIndex", versionIndex,
                "stdin", stdin
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request =
                new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(apiUrl, request, Map.class);

        return response.getBody();
    }
}
