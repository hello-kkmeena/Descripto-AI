package com.descripto.api.controller;

import com.descripto.api.Constant;
import com.descripto.api.dto.*;
import com.descripto.api.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    /**
     * Create secure HTTP-only cookie
     */
    private ResponseCookie createSecureCookie(String name, String value, long maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(maxAge)
                .sameSite("None")
                .domain(Constant.DOMAIN)
                .build();
    }

    /**
     * Add auth cookies to response
     */
    private ResponseEntity<ApiResponse<LoginResponse>> addAuthCookies(LoginResponse loginResponse, String message) {
        // Create cookies with appropriate expiry
        ResponseCookie accessTokenCookie = createSecureCookie(
                Constant.ACCESS_TOKEN_NAME,
            loginResponse.getAccessToken(),
            24 * 60 * 60 // 24 hours
        );

        ResponseCookie refreshTokenCookie = createSecureCookie(
                Constant.REFRESH_TOKEN_NAME,
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
            @Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        LoginResponse loginResponse;
        try {
            loginResponse = authService.login(loginRequest);
            // Use existing createSecureCookie method
            ResponseCookie accessTokenCookie = createSecureCookie(
                    Constant.ACCESS_TOKEN_NAME,
                    loginResponse.getAccessToken(),
                    24 * 60 * 60 // 24 hours
            );

            ResponseCookie refreshTokenCookie = createSecureCookie(
                    Constant.REFRESH_TOKEN_NAME,
                    loginResponse.getRefreshToken(),
                    7 * 24 * 60 * 60 // 7 days
            );

            // Add cookies to response
            response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());
            response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

            return ResponseEntity.ok(ApiResponse.success(loginResponse, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
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
            @CookieValue(name = Constant.REFRESH_TOKEN_NAME, required = false) String refreshToken
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