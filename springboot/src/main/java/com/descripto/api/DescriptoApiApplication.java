package com.descripto.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot Application class for Descripto API Backend
 * 
 * This application provides a secure, scalable API management backend
 * with comprehensive security, monitoring, and database capabilities.
 * 
 * @author Descripto Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
public class DescriptoApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(DescriptoApiApplication.class, args);
    }
} 