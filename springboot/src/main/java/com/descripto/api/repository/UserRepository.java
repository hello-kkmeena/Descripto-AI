package com.descripto.api.repository;

import com.descripto.api.model.User;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory user repository using lists
 * 
 * @author Descripto Team
 */
@Repository
@Slf4j
public class UserRepository {
    
    private final Map<Long, User> users = new ConcurrentHashMap<>();
    private final Map<String, User> usersByUsername = new ConcurrentHashMap<>();
    private final Map<String, User> usersByEmail = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostConstruct
    public void init() {
        initializeDefaultUsers();
    }
    
    /**
     * Initialize default users for testing
     */
    private void initializeDefaultUsers() {
        String adminPassword = "admin123";
        String encodedPassword = passwordEncoder.encode(adminPassword);
        
        User adminUser = User.builder()
                .id(idGenerator.getAndIncrement())
                .username("admin")
                .email("admin@descripto.ai")
                .passwordHash(encodedPassword)
                .firstName("Admin")
                .lastName("User")
                .active(true)
                .verified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .roles(Arrays.asList("ROLE_ADMIN", "ROLE_USER"))
                .build();
        
        save(adminUser);
        
        User testUser = User.builder()
                .id(idGenerator.getAndIncrement())
                .username("test")
                .email("test@descripto.ai")
                .passwordHash(encodedPassword)
                .firstName("Test")
                .lastName("User")
                .active(true)
                .verified(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .roles(Arrays.asList("ROLE_USER"))
                .build();
        
        save(testUser);
        
        log.info("Default users initialized successfully");
    }
    
    /**
     * Save user
     */
    public User save(User user) {
        try {
            MDC.put("userId", String.valueOf(user.getId()));
            MDC.put("username", user.getUsername());
            
            if (user.getId() == null) {
                user.setId(idGenerator.getAndIncrement());
                user.setCreatedAt(Instant.now());
                log.info("Creating new user");
            } else {
                log.info("Updating existing user");
            }
            
            user.setUpdatedAt(Instant.now());
            
            users.put(user.getId(), user);
            usersByUsername.put(user.getUsername(), user);
            usersByEmail.put(user.getEmail(), user);
            
            return user;
        } finally {
            MDC.remove("userId");
            MDC.remove("username");
        }
    }
    
    /**
     * Find user by ID
     */
    public Optional<User> findById(Long id) {
        MDC.put("userId", String.valueOf(id));
        try {
            Optional<User> user = Optional.ofNullable(users.get(id));
            if (user.isPresent()) {
                log.debug("User found by ID");
            } else {
                log.debug("User not found by ID");
            }
            return user;
        } finally {
            MDC.remove("userId");
        }
    }
    
    /**
     * Find user by username
     */
    public Optional<User> findByUsername(String username) {
        MDC.put("username", username);
        try {
            Optional<User> user = Optional.ofNullable(usersByUsername.get(username));
            if (user.isPresent()) {
                log.debug("User found by username");
            } else {
                log.debug("User not found by username");
            }
            return user;
        } finally {
            MDC.remove("username");
        }
    }
    
    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        MDC.put("email", email);
        try {
            Optional<User> user = Optional.ofNullable(usersByEmail.get(email));
            if (user.isPresent()) {
                log.debug("User found by email");
            } else {
                log.debug("User not found by email");
            }
            return user;
        } finally {
            MDC.remove("email");
        }
    }
    
    /**
     * Find all users
     */
    public List<User> findAll() {
        log.debug("Retrieving all users");
        return new ArrayList<>(users.values());
    }
    
    /**
     * Delete user by ID
     */
    public boolean deleteById(Long id) {
        try {
            MDC.put("userId", String.valueOf(id));
            
            User user = users.remove(id);
            if (user != null) {
                MDC.put("username", user.getUsername());
                usersByUsername.remove(user.getUsername());
                usersByEmail.remove(user.getEmail());
                log.info("User deleted successfully");
                return true;
            }
            log.debug("User not found for deletion");
            return false;
        } finally {
            MDC.remove("userId");
            MDC.remove("username");
        }
    }
    
    /**
     * Check if user exists by username
     */
    public boolean existsByUsername(String username) {
        MDC.put("username", username);
        try {
            boolean exists = usersByUsername.containsKey(username);
            log.debug("User existence check by username: {}", exists);
            return exists;
        } finally {
            MDC.remove("username");
        }
    }
    
    /**
     * Check if user exists by email
     */
    public boolean existsByEmail(String email) {
        MDC.put("email", email);
        try {
            boolean exists = usersByEmail.containsKey(email);
            log.debug("User existence check by email: {}", exists);
            return exists;
        } finally {
            MDC.remove("email");
        }
    }
    
    /**
     * Update user's last login
     */
    public void updateLastLogin(Long userId) {
        try {
            MDC.put("userId", String.valueOf(userId));
            findById(userId).ifPresent(user -> {
                MDC.put("username", user.getUsername());
                user.setLastLogin(Instant.now());
                user.setUpdatedAt(Instant.now());
                save(user);
                log.info("User last login updated");
            });
        } finally {
            MDC.remove("userId");
            MDC.remove("username");
        }
    }
    
    /**
     * Get total user count
     */
    public long count() {
        long count = users.size();
        log.debug("Total user count: {}", count);
        return count;
    }
} 