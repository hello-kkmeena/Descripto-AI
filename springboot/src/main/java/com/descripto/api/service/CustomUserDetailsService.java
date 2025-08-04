package com.descripto.api.service;

import com.descripto.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Custom UserDetailsService implementation
 * 
 * Provides user details for Spring Security authentication
 * 
 * @author Descripto Team
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user by username: {}", username);
        return userRepository.findByEmailOrMobileNumber(username)
                .map(user -> {
                    log.debug("Found user: {}, roles: {}, password hash: {}",
                        user.getUsername(), user.getRoles(), user.getPasswordHash());
                    List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                            .map(role -> {
                                log.debug("Adding authority: {}", role);
                                return new SimpleGrantedAuthority(role);
                            })
                            .collect(Collectors.toList());
                    log.debug("Created authorities: {}", authorities);
                    
                    return User.builder()
                            .username(user.getUsername()) // Will use email if available, otherwise mobile
                            .password(user.getPasswordHash())
                            .authorities(authorities)
                            .accountExpired(false)
                            .accountLocked(false)
                            .credentialsExpired(false)
                            .disabled(!user.isActive())
                            .build();
                })
                .orElseThrow(() -> {
                    log.warn("User not found with username: {}", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });
    }
} 