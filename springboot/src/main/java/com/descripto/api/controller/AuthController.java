package com.descripto.api.controller;

import com.descripto.api.dto.ApiResponse;
import com.descripto.api.dto.LoginRequest;
import com.descripto.api.dto.LoginResponse;
import com.descripto.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication Controller
 * 
 * Handles user authentication and authorization
 * 
 * @author krishna.meena
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(
    name = "Authentication",
    description = """
        Authentication endpoints for user management.
        
        These endpoints handle:
        * User login with username/password
        * JWT token generation
        * Token refresh
        * Session management
        """
)
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * User login endpoint
     */
    @PostMapping(
        value = "/login",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
        summary = "Authenticate user",
        description = """
            Authenticate a user with username and password.
            
            On successful authentication:
            * Returns a JWT access token
            * Returns a refresh token
            * Updates user's last login timestamp
            * Returns user details
            
            The access token should be included in subsequent requests in the Authorization header:
            `Authorization: Bearer <access_token>`
            """,
        tags = {"Authentication"}
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Authentication successful",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                schema = @Schema(implementation = LoginResponse.class),
                examples = @ExampleObject(
                    value = """
                        {
                          "success": true,
                          "message": "Login successful",
                          "data": {
                            "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
                            "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
                            "tokenType": "Bearer",
                            "expiresIn": 86400000,
                            "username": "admin",
                            "email": "admin@descripto.ai",
                            "roles": ["ROLE_ADMIN", "ROLE_USER"]
                          },
                          "timestamp": "2025-07-25T10:54:38.221Z",
                          "statusCode": 0
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid credentials",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "message": "Business rule violation",
                          "error": "Invalid username or password",
                          "timestamp": "2025-07-25T10:54:38.221Z",
                          "statusCode": 400
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "429",
            description = "Too many login attempts",
            content = @Content(
                mediaType = MediaType.APPLICATION_JSON_VALUE,
                examples = @ExampleObject(
                    value = """
                        {
                          "success": false,
                          "message": "Rate limit exceeded",
                          "error": "Too many login attempts. Please try again later.",
                          "timestamp": "2025-07-25T10:54:38.221Z",
                          "statusCode": 429
                        }
                        """
                )
            )
        )
    })
    public ResponseEntity<ApiResponse<LoginResponse>> login(
        @Parameter(
            description = "Login credentials",
            required = true,
            schema = @Schema(implementation = LoginRequest.class),
            examples = @ExampleObject(
                value = """
                    {
                      "username": "admin",
                      "password": "admin123"
                    }
                    """
            )
        )
        @Valid @RequestBody LoginRequest loginRequest
    ) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }
} 