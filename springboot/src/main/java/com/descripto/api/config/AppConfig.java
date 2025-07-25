package com.descripto.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Application configuration
 * 
 * @author krishna.meena
 */
@Configuration
@Slf4j
public class AppConfig {

    /**
     * Configure password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        log.debug("Creating BCryptPasswordEncoder bean");
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Test the encoder
        String testPassword = "admin123";
        String encoded = encoder.encode(testPassword);
        log.debug("Test encoding - Raw: {}, Encoded: {}", testPassword, encoded);
        
        // Test matching
        boolean matches = encoder.matches(testPassword, encoded);
        log.debug("Test matching - Raw: {}, Hash: {}, Matches: {}", 
            testPassword, encoded, matches);
        
        return encoder;
    }
} 