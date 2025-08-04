package com.descripto.api.controller;

import com.descripto.api.dto.*;
import com.descripto.api.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
@Tag(name = "Authentication")
@Slf4j
public class AuthController {

    private final AuthService authService;

    @Value("${app.cookie.domain:#{null}}")
    private String cookieDomain;

    @Value("${app.environment:prod}")
    private String environment;

    /**
     * Create secure HTTP-only cookie
     */
    private ResponseCookie createSecureCookie(String name, String value, long maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure("dev".equals(environment) ? false : true)
                .path("/")
                .maxAge(maxAge);

        // Only set domain in production and if it's not localhost
        if (!"dev".equals(environment) && cookieDomain != null && !cookieDomain.contains("localhost")) {
            // Remove any port numbers from domain
            String domain = cookieDomain.split(":")[0];
            log.debug("Setting cookie domain to: {}", domain);
            builder.domain(domain);
        }

        // Set SameSite attribute based on environment
        builder.sameSite("dev".equals(environment) ? "Lax" : "Strict");

        return builder.build();
    }

    /**
     * Add auth cookies to response
     */
    private ResponseEntity<ApiResponse<LoginResponse>> addAuthCookies(LoginResponse loginResponse, String message) {
        // Create cookies with appropriate expiry
        ResponseCookie accessTokenCookie = createSecureCookie(
            "access_token",
            loginResponse.getAccessToken(),
            24 * 60 * 60 // 24 hours
        );

        ResponseCookie refreshTokenCookie = createSecureCookie(
            "refresh_token",
            loginResponse.getRefreshToken(),
            7 * 24 * 60 * 60 // 7 days
        );

        // Build response with cookies
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessTokenCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(ApiResponse.success(loginResponse, message));
    }

    /**
     * Clear auth cookies
     */
    private ResponseEntity<ApiResponse<Void>> clearAuthCookies() {
        ResponseCookie accessTokenCookie = createSecureCookie("access_token", "", 0);
        ResponseCookie refreshTokenCookie = createSecureCookie("refresh_token", "", 0);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessTokenCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(ApiResponse.success(null, "Logged out successfully"));
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(loginRequest);
        
        // Set access token cookie
        Cookie accessTokenCookie = new Cookie("access_token", loginResponse.getAccessToken());
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(24 * 60 * 60); // 24 hours
        
        // Set refresh token cookie
        Cookie refreshTokenCookie = new Cookie("refresh_token", loginResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        
        // Set domain for non-localhost environments
        if (!"dev".equals(environment) && cookieDomain != null && !cookieDomain.contains("localhost")) {
            String domain = cookieDomain.split(":")[0];
            accessTokenCookie.setDomain(domain);
            refreshTokenCookie.setDomain(domain);
        }
        
        // Add cookies to response
        response.addCookie(accessTokenCookie);
        response.addCookie(refreshTokenCookie);
        
        return ResponseEntity.ok(ApiResponse.success(loginResponse, "Login successful"));
    }

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<LoginResponse>> register(
            @Valid @RequestBody UserRegistrationRequest registrationRequest
    ) {
        LoginResponse response = authService.register(registrationRequest);
        return addAuthCookies(response, "Registration successful");
    }

    @GetMapping(value = "/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UserProfileResponse profile = authService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }

    @PostMapping(value = "/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(
            @CookieValue(name = "refresh_token", required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No refresh token provided"));
        }

        LoginResponse response = authService.refreshToken(refreshToken);
        return addAuthCookies(response, "Token refresh successful");
    }

    @PostMapping(value = "/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return clearAuthCookies();
    }
} 