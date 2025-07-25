package com.descripto.api.controller;

import com.descripto.api.dto.ApiResponse;
import com.descripto.api.model.User;
import com.descripto.api.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * User Controller
 * 
 * Handles user-related operations
 * 
 * @author Descripto Team
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
@Slf4j
public class UserController {

    private final UserRepository userRepository;

    /**
     * Get all users (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Get all users",
        description = "Retrieve all users (Admin access required)"
    )
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        log.info("Retrieving all users");
        
        List<User> users = userRepository.findAll();
        
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    /**
     * Get user count
     */
    @GetMapping("/count")
    @Operation(
        summary = "Get user count",
        description = "Retrieve total number of users"
    )
    public ResponseEntity<ApiResponse<Long>> getUserCount() {
        log.info("Retrieving user count");
        
        long count = userRepository.count();
        
        return ResponseEntity.ok(ApiResponse.success(count, "User count retrieved successfully"));
    }
} 