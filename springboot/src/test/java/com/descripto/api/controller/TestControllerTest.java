package com.descripto.api.controller;

import com.descripto.api.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for TestController
 * 
 * Tests the /test endpoint functionality
 * 
 * @author Descripto Team
 */
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
class TestControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @Test
    void testEndpoint_ShouldReturnSuccessResponse() throws Exception {
        // Setup
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Execute and verify
        mockMvc.perform(get("/test")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Test endpoint accessed successfully"))
                .andExpect(jsonPath("$.data.message").value("Descripto API Backend is running successfully!"))
                .andExpect(jsonPath("$.data.status").value("healthy"))
                .andExpect(jsonPath("$.data.version").value("1.0.0"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
} 