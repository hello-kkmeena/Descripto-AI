package com.descripto.api.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Scheduler for periodic health checks
 * Calls the test API every 60 seconds to verify system health
 */
@Component
@Slf4j
public class HealthCheckScheduler {

    private static final String TEST_URL = "https://api.descripto.ai/api/v1/test";
    private final RestTemplate restTemplate = new RestTemplate();

    @Scheduled(fixedRate = 60000) // Execute every 60 seconds
    public void checkHealth() {
        try {
            log.debug("Executing scheduled health check: {}", TEST_URL);

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                TEST_URL,
                HttpMethod.GET,
                entity,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Health check successful. Status: {}", response.getStatusCode());
            } else {
                log.warn("Health check returned non-200 status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Health check failed: {}", e.getMessage());
        }
    }
}