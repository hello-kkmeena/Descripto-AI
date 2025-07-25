package com.descripto.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Basic application context test
 * 
 * Ensures the Spring Boot application starts correctly
 * 
 * @author Descripto Team
 */
@SpringBootTest
@ActiveProfiles("test")
class DescriptoApiApplicationTests {

    @Test
    void contextLoads() {
        // This test will pass if the application context loads successfully
    }
} 