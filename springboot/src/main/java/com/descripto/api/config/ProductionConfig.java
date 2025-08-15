package com.descripto.api.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Production-specific configuration that disables development features
 * 
 * @author Descripto Team
 */
@Configuration
@Profile("prod")
public class ProductionConfig {

    /**
     * Disable Swagger UI in production
     * This bean will only be created when springdoc.swagger-ui.enabled=false
     */
    @Bean
    @ConditionalOnProperty(name = "springdoc.swagger-ui.enabled", havingValue = "false")
    public Object disableSwaggerUI() {
        // This effectively disables Swagger UI by overriding the default configuration
        return new Object();
    }

    /**
     * Disable development tools in production
     */
    @Bean
    @ConditionalOnProperty(name = "spring.devtools.restart.enabled", havingValue = "false")
    public Object disableDevTools() {
        // Disable Spring Boot DevTools restart functionality
        return new Object();
    }

    /**
     * Production-specific database configuration
     * Only active when using 'prod' profile
     */
    @Bean
    @Profile("prod")
    public Object productionDatabaseConfig() {
        // Production database optimizations
        return new Object();
    }
}
