package com.descripto.api.config;

import com.descripto.api.security.JwtAuthenticationEntryPoint;
import com.descripto.api.security.JwtAuthenticationFilter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.ArrayList;

/**
 * Security configuration for the Descripto API Backend
 * 
 * Provides comprehensive security setup including:
 * - JWT-based authentication
 * - Security headers
 * - Method-level security
 * 
 * @author krishna.meena
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Slf4j
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.frontend-domain}")
    private String frontendDomain;

    @Value("${app.environment:prod}")
    private String environment;

    @Value("${app.cors.max-age:3600}")
    private Long corsMaxAge;

    /**
     * Configure authentication provider
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        log.info("Configuring authentication provider");
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        authProvider.setHideUserNotFoundExceptions(false);
        try {
            authProvider.afterPropertiesSet();
            log.debug("DaoAuthenticationProvider configured successfully");
        } catch (Exception e) {
            log.error("Error configuring DaoAuthenticationProvider: {}", e.getMessage(), e);
            throw new IllegalStateException("Failed to configure DaoAuthenticationProvider", e);
        }
        return authProvider;
    }

    /**
     * Configure authentication manager
     */
    @Bean
    public AuthenticationManager authenticationManager() {
        log.info("Configuring AuthenticationManager");
        DaoAuthenticationProvider provider = authenticationProvider();
        try {
            ProviderManager manager = new ProviderManager(List.of(provider));
            log.debug("AuthenticationManager configured successfully");
            return manager;
        } catch (Exception e) {
            log.error("Error configuring AuthenticationManager: {}", e.getMessage(), e);
            throw new IllegalStateException("Failed to configure AuthenticationManager", e);
        }
    }

    /**
     * Configure security filter chain with JWT authentication
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        log.info("Configuring security filter chain");
        
        http
            // Enable CORS and disable CSRF
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            
            // Configure session management
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Configure exception handling
            .exceptionHandling(exception -> 
                exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            
            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(
                    // Auth endpoints
                    "/auth/login", "/auth/register","/auth/refresh",
                    
                    // Actuator endpoints
                    "/actuator/**",
                    
                    // Swagger UI v3 (OpenAPI)
                    "/v3/api-docs/**",
                    "/v3/api-docs.yaml",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/swagger-ui/index.html",
                    "/swagger-ui/swagger-ui.css",
                    "/swagger-ui/swagger-ui-bundle.js",
                    "/swagger-ui/swagger-ui-standalone-preset.js",
                    "/swagger-ui/swagger-initializer.js",
                    "/webjars/swagger-ui/**",
                    
                    // OpenAPI resources
                    "/swagger-resources",
                    "/swagger-resources/**",
                    "/configuration/ui",
                    "/configuration/security",
                    "/v2/api-docs" // For older clients
                ).permitAll()
                .anyRequest().authenticated()
            )
            
            // Add JWT filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.debug("Configuring CORS with frontend domain: {}", frontendDomain);
        
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow frontend domain and localhost for development
        configuration.setAllowedOriginPatterns(getAllowedOrigins());
        
        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Allow common headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests
        configuration.setMaxAge(corsMaxAge);
        
        // Expose headers that frontend might need
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Authorization"
        ));

        log.debug("CORS configuration: allowedOrigins={}, allowedMethods={}, allowedHeaders={}, maxAge={}",
            configuration.getAllowedOriginPatterns(),
            configuration.getAllowedMethods(),
            configuration.getAllowedHeaders(),
            configuration.getMaxAge());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private List<String> getAllowedOrigins() {
        List<String> origins = new ArrayList<>();
        origins.add(frontendDomain);
        
        if ("dev".equals(environment)) {
            origins.addAll(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001"
            ));
        }
        return origins;
    }
} 