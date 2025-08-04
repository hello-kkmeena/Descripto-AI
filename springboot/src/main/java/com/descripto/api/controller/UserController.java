package com.descripto.api.controller;

import com.descripto.api.dto.ApiResponse;
import com.descripto.api.dto.UserRegistrationRequest;
import com.descripto.api.model.User;
import com.descripto.api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for user registration and management")
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Register a new user with email and/or mobile number")
    public ResponseEntity<ApiResponse<User>> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        User user = userService.registerUser(request);
        return ResponseEntity.ok(ApiResponse.success(user, "User registered successfully. Please verify your email/mobile."));
    }

    @GetMapping("/verify/email")
    @Operation(summary = "Verify email", description = "Verify user's email using the verification token")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @Parameter(description = "Email verification token") @RequestParam String token) {
        userService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @PostMapping("/verify/mobile")
    @Operation(summary = "Verify mobile number", description = "Verify user's mobile number using the verification code")
    public ResponseEntity<ApiResponse<Void>> verifyMobile(
            @Parameter(description = "Mobile number") @RequestParam String mobileNumber,
            @Parameter(description = "Verification code") @RequestParam String code) {
        userService.verifyMobile(mobileNumber, code);
        return ResponseEntity.ok(ApiResponse.success(null, "Mobile number verified successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Get a list of all users (Admin only)")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID", description = "Get user details by ID (Admin only)")
    public ResponseEntity<ApiResponse<User>> getUserById(
            @Parameter(description = "User ID") @PathVariable Long id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.success(user, "User retrieved successfully")))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user by ID (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "User ID") @PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
} 