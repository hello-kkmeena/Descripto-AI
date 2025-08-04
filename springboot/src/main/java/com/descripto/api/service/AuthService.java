package com.descripto.api.service;

import com.descripto.api.dto.*;
import com.descripto.api.exception.BusinessException;
import com.descripto.api.exception.UserException;
import com.descripto.api.exception.ValidationException;
import com.descripto.api.model.User;
import com.descripto.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse login(LoginRequest loginRequest) throws UserException {
        MDC.put("username", loginRequest.getUsername());
        try {
            log.info("Authentication attempt received");
            
            // Check if user exists by email or mobile
            User user = userRepository.findByEmailOrMobileNumber(loginRequest.getUsername())
                    .orElseThrow(() -> {
                        log.warn("User not found: {}", loginRequest.getUsername());
                        return new ValidationException("Invalid username or password");
                    });
            
            log.debug("Found user: {}, roles: {}, stored password hash: {}",
                user.getUsername(), user.getRoles(), user.getPasswordHash());

            // Verify password manually first (for debugging purposes)
            boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash());
            log.debug("Password match result: {}", passwordMatches);
            if (!passwordMatches) {
                log.warn("Password does not match for user: {}", loginRequest.getUsername());
                throw new UserException("Invalid username or password");
            }

            // Create authentication token
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user.getUsername(), // Use the consistent username (email or mobile)
                loginRequest.getPassword()
            );
            log.debug("Created authentication token: {}", authToken);

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(authToken);
            log.debug("Authentication successful, principal: {}, authorities: {}",
                authentication.getPrincipal(), authentication.getAuthorities());

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate JWT tokens
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            log.debug("Generated tokens for user: {}", userDetails.getUsername());

            // Update last login
            userRepository.updateLastLogin(user.getId(), Instant.now());
            log.info("Authentication successful");

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400000L) // 24 hours
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .roles(user.getRoles())
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Authentication failed for user: {}", loginRequest.getUsername());
            throw new UserException("Invalid username or password");
        } catch (Exception e) {
            log.error("Error while log in: {}", e.getMessage());
            throw e;

        } finally {
            MDC.remove("username");
        }
    }

    @Transactional
    public LoginResponse register(UserRegistrationRequest registrationRequest) throws UserException {
        MDC.put("username", registrationRequest.getEmail());
        try {
            log.info("Registration attempt received");
            
            // Check if user already exists
            if (userRepository.findByEmailOrMobileNumber(registrationRequest.getEmail()).isPresent()) {
                log.warn("User already exists: {}", registrationRequest.getEmail());
                throw new ValidationException("User already exists with this email");
            }

            // Create new user
            User user = User.builder()
                    .email(registrationRequest.getEmail())
                    .passwordHash(passwordEncoder.encode(registrationRequest.getPassword()))
                    .firstName(registrationRequest.getFirstName())
                    .lastName(registrationRequest.getLastName())
                    .roles(new HashSet<>(Collections.singletonList("ROLE_USER")))
                    .active(true)
                    .verified(false)
                    .createdAt(Instant.now())
                    .lastLogin(Instant.now())
                    .build();

            // Save user
            user = userRepository.save(user);
            log.debug("Created new user: {}", user.getUsername());

            // Create authentication token
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                registrationRequest.getPassword()
            );

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(authToken);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate JWT tokens
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            log.debug("Generated tokens for new user: {}", userDetails.getUsername());

            log.info("Registration successful");

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400000L) // 24 hours
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .roles(user.getRoles())
                    .build();

        } catch (Exception e) {
            log.error("Error during registration: {}", e.getMessage());
            throw e;
        } finally {
            MDC.remove("username");
        }
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String username) throws UserException {
        User user = userRepository.findByEmailOrMobileNumber(username)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", username);
                    return new UserException("User not found");
                });

        return UserProfileResponse.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles())
                .createdAt(user.getCreatedAt().toString())
                .lastLoginAt(user.getLastLogin() != null ? user.getLastLogin().toString() : null)
                .build();
    }

    @Transactional
    public LoginResponse refreshToken(String refreshToken) throws UserException {
        try {
            // Extract username from token
            String username = jwtService.extractUsername(refreshToken);
            log.debug("Refreshing token for user: {}", username);

            // Get user details
            User user = userRepository.findByEmailOrMobileNumber(username)
                    .orElseThrow(() -> {
                        log.warn("User not found during token refresh: {}", username);
                        return new UserException("User not found");
                    });

            // Create UserDetails object
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getUsername())
                    .password(user.getPasswordHash())
                    .authorities(user.getRoles().stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList()))
                    .build();

            // Validate refresh token
            if (!jwtService.isTokenValid(refreshToken, userDetails)) {
                throw new ValidationException("Invalid refresh token");
            }

            // Generate new tokens
            String newAccessToken = jwtService.generateToken(userDetails);
            String newRefreshToken = jwtService.generateRefreshToken(userDetails);
            log.debug("Generated new tokens for user: {}", username);

            return LoginResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400000L) // 24 hours
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .roles(user.getRoles())
                    .build();

        } catch (Exception e) {
            log.error("Error during token refresh: {}", e.getMessage());
            throw e;
        }
    }
} 