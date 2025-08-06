package com.descripto.api.scheduler;

import com.descripto.api.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

/**
 * Scheduler for periodic health checks
 * Calls the test API every 60 seconds to verify system health
 */
@Component
@Slf4j
public class HealthCheckScheduler {
    
    private final RestTemplate restTemplate;
    private final String baseUrl;
    
    public HealthCheckScheduler(
            @Value("${app.base-url:http://localhost:8080/api/v1}") String baseUrl) {
        this.restTemplate = new RestTemplate();
        this.baseUrl = baseUrl;
    }
    
    @Scheduled(fixedRate = 60000) // Execute every 60 seconds
    public void checkHealth() {
        try {
            log.debug("Executing scheduled health check");
            ResponseEntity<ApiResponse<Map<String, Object>>> response = restTemplate.exchange(
                baseUrl + "/test",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {}
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