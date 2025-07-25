package com.descripto.api.service;

import com.descripto.api.dto.LoginRequest;
import com.descripto.api.dto.LoginResponse;
import com.descripto.api.exception.BusinessException;
import com.descripto.api.model.User;
import com.descripto.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest loginRequest) {
        MDC.put("username", loginRequest.getUsername());
        try {
            log.info("Authentication attempt received");
            
            // Check if user exists by email or mobile
            User user = userRepository.findByEmailOrMobileNumber(loginRequest.getUsername())
                    .orElseThrow(() -> {
                        log.warn("User not found: {}", loginRequest.getUsername());
                        return new BusinessException("Invalid username or password");
                    });
            
            log.debug("Found user: {}, roles: {}, stored password hash: {}",
                user.getUsername(), user.getRoles(), user.getPasswordHash());

            // Verify password manually first (for debugging purposes)
            boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash());
            log.debug("Password match result: {}", passwordMatches);
            if (!passwordMatches) {
                log.warn("Password does not match for user: {}", loginRequest.getUsername());
                throw new BadCredentialsException("Invalid password");
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
            throw new BusinessException("Invalid username or password");
        } catch (Exception e) {
            log.error("Login error for user: {}", loginRequest.getUsername(), e);
            throw new BusinessException("Invalid username or password");
        } finally {
            MDC.remove("username");
        }
    }
} 