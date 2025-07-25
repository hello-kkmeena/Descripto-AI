package com.descripto.api.repository;

import com.descripto.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByMobileNumber(String mobileNumber);
    Optional<User> findByVerificationToken(String token);
    boolean existsByEmail(String email);
    boolean existsByMobileNumber(String mobileNumber);

    @Query("SELECT u FROM User u WHERE u.email = ?1 OR u.mobileNumber = ?1")
    Optional<User> findByEmailOrMobileNumber(String username);

    @Modifying
    @Query("UPDATE User u SET u.lastLogin = ?2 WHERE u.id = ?1")
    void updateLastLogin(Long userId, Instant lastLogin);
} 