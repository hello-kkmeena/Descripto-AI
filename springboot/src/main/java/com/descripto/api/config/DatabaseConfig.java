package com.descripto.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.descripto.api.repository")
@EnableTransactionManagement
public class DatabaseConfig {
    // Spring Boot will auto-configure:
    // - DataSource
    // - EntityManagerFactory
    // - TransactionManager
} 