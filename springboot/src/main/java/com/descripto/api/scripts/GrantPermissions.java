package com.descripto.api.scripts;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class GrantPermissions {
    private static final Logger log = LoggerFactory.getLogger(GrantPermissions.class);

    public static void main(String[] args) {
        String url = "jdbc:postgresql://6-eiho.h.filess.io:61007/DescriptoAI_heartburst";
        String username = "DescriptoAI_heartburst";
        String password = "9863f51e7b790fa9e9384e08ad86883f8c60f13a";

        try {
            // Read the SQL script
            String sql = new String(Files.readAllBytes(
                Paths.get("src/main/resources/db/grant_permissions.sql")));

            // Connect to the database
            log.info("Connecting to database...");
            Connection conn = DriverManager.getConnection(url, username, password);
            
            // Execute the SQL script
            log.info("Executing permissions script...");
            Statement stmt = conn.createStatement();
            stmt.execute(sql);
            
            log.info("Permissions granted successfully!");
            
            // Close resources
            stmt.close();
            conn.close();
            
        } catch (Exception e) {
            log.error("Error granting permissions: {}", e.getMessage(), e);
        }
    }
} 