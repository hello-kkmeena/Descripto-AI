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

/**
 * Authentication service
 * 
 * Handles user authentication and JWT token generation
 * 
 * @author Descripto Team
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authenticate user and generate JWT tokens
     */
    public LoginResponse login(LoginRequest loginRequest) {
        MDC.put("username", loginRequest.getUsername());
        try {
            log.info("Authentication attempt received");
            
            // Create authentication token
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            );
            
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(authToken);
            
            // Get user details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> {
                        log.error("User not found after successful authentication");
                        return new BusinessException("User not found");
                    });
            
            // Generate JWT tokens
            String accessToken = jwtService.generateToken(userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);
            
            // Update last login
            userRepository.updateLastLogin(user.getId());
            
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
            log.warn("Authentication failed: Invalid credentials");
            throw new BusinessException("Invalid username or password");
        } catch (Exception e) {
            log.error("Authentication failed: {}", e.getMessage(), e);
            throw new BusinessException("Invalid username or password");
        } finally {
            MDC.remove("username");
        }
    }
} 