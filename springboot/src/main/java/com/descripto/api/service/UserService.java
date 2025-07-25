package com.descripto.api.service;

import com.descripto.api.dto.UserRegistrationRequest;
import com.descripto.api.model.User;
import com.descripto.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.verification.token.expiry-hours:24}")
    private int verificationTokenExpiryHours;

    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        // Validate unique email/mobile
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (request.getMobileNumber() != null && userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new IllegalArgumentException("Mobile number already registered");
        }

        // At least one of email or mobile is required
        if (request.getEmail() == null && request.getMobileNumber() == null) {
            throw new IllegalArgumentException("Either email or mobile number is required");
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .active(true)
                .verified(false)
                .mobileVerified(false)
                .verificationToken(generateVerificationToken())
                .verificationTokenExpiry(Instant.now().plus(verificationTokenExpiryHours, ChronoUnit.HOURS))
                .build();

        user = userRepository.save(user);

        // Send verification email if email provided
        if (request.getEmail() != null) {
            sendVerificationEmail(user);
        }

        // Send verification SMS if mobile provided
        if (request.getMobileNumber() != null) {
            sendVerificationSMS(user);
        }

        return user;
    }

    @Transactional
    public boolean verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (user.isVerified()) {
            return true; // Already verified
        }

        if (user.getVerificationTokenExpiry().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);

        return true;
    }

    @Transactional
    public boolean verifyMobile(String mobileNumber, String code) {
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new IllegalArgumentException("Invalid mobile number"));

        if (user.isMobileVerified()) {
            return true; // Already verified
        }

        if (user.getMobileVerificationCodeExpiry().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        if (!user.getMobileVerificationCode().equals(code)) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        user.setMobileVerified(true);
        user.setMobileVerificationCode(null);
        user.setMobileVerificationCodeExpiry(null);
        userRepository.save(user);

        return true;
    }

    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }

    private void sendVerificationEmail(User user) {
        String verificationLink = "http://your-domain.com/verify?token=" + user.getVerificationToken();
        emailService.sendVerificationEmail(user.getEmail(), verificationLink);
    }

    private void sendVerificationSMS(User user) {
        String code = generateVerificationCode();
        user.setMobileVerificationCode(code);
        user.setMobileVerificationCodeExpiry(Instant.now().plus(15, ChronoUnit.MINUTES));
        userRepository.save(user);
        // TODO: Implement SMS service
        log.info("SMS verification code for {}: {}", user.getMobileNumber(), code);
    }

    private String generateVerificationCode() {
        return String.format("%06d", (int) (Math.random() * 1000000));
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByMobileNumber(String mobileNumber) {
        return userRepository.findByMobileNumber(mobileNumber);
    }

    @Transactional(readOnly = true)
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
} 