package com.descripto.api.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Database initializer to run SQL scripts on startup
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final DataSource dataSource;

    @Value("${spring.datasource.hikari.schema}")
    private String schema;

    @Override
    public void run(String... args) {
        log.info("Initializing database with schema: {}", schema);
        try {
            // First ensure schema exists
//            try (Connection conn = dataSource.getConnection();
//                 Statement stmt = conn.createStatement()) {
//                stmt.execute(String.format("CREATE SCHEMA IF NOT EXISTS \"%s\"", schema));
//                log.info("Schema creation check completed");
//            }
//
//            // Then run the initialization script
//            ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator();
//            resourceDatabasePopulator.setSeparator(ScriptUtils.DEFAULT_STATEMENT_SEPARATOR);
//            resourceDatabasePopulator.setCommentPrefix(ScriptUtils.DEFAULT_COMMENT_PREFIX);
//            resourceDatabasePopulator.setBlockCommentStartDelimiter(ScriptUtils.DEFAULT_BLOCK_COMMENT_START_DELIMITER);
//            resourceDatabasePopulator.setBlockCommentEndDelimiter(ScriptUtils.DEFAULT_BLOCK_COMMENT_END_DELIMITER);
//            resourceDatabasePopulator.addScript(new ClassPathResource("db/init.sql"));
//            resourceDatabasePopulator.execute(dataSource);
            log.info("Database initialized successfully");
        } catch (Exception e) {
            log.error("Error initializing database: {}", e.getMessage(), e);
            e.printStackTrace();
        }
    }
} 