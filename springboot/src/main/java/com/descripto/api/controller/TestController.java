package com.descripto.api.controller;

import com.descripto.api.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Test Controller for API testing and health verification
 * 
 * Provides endpoints for testing API functionality and connectivity
 * 
 * @author Descripto Team
 */
@RestController
@RequestMapping("/test")
@Tag(name = "Test", description = "Test endpoints for API verification")
@Slf4j
public class TestController {

    /**
     * Test endpoint to verify API functionality
     * 
     * @return API response with test information
     */
    @GetMapping
    @Operation(
        summary = "Test API endpoint",
        description = "Returns a test response to verify API functionality and connectivity"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Test successful",
            content = @Content(
                schema = @Schema(implementation = ApiResponse.class)
            )
        )
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> test() {
        log.info("Test endpoint accessed");
        
        Map<String, Object> testData = new HashMap<>();
        testData.put("message", "Descripto API Backend is running successfully!");
        testData.put("timestamp", LocalDateTime.now());
        testData.put("status", "healthy");
        testData.put("version", "1.0.0");
        testData.put("environment", "development");
        
        ApiResponse<Map<String, Object>> response = ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Test endpoint accessed successfully")
                .data(testData)
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.ok(response);
    }
} 