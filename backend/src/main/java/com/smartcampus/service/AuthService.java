package com.smartcampus.service;

import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.dto.RegisterRequest;
import com.smartcampus.model.NotificationPriority;
import com.smartcampus.model.NotificationType;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Handles registration and login with advanced security mechanisms:
 * - Account locking after 3 failed attempts
 * - Status checks (Active, Locked, Disabled)
 * - Security auditing via AuditService
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtil               jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsService    userDetailsService;
    private final AuditService          auditService;
    private final NotificationService   notificationService;

    // ── Register ─────────────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByCampusEmail(req.getCampusEmail()).isPresent()) {
            throw new IllegalArgumentException("Campus email already registered: " + req.getCampusEmail());
        }
        if (userRepository.findByCampusId(req.getCampusId()).isPresent()) {
            throw new IllegalArgumentException("Campus ID already registered: " + req.getCampusId());
        }

        Role role = (req.getRole() != null) ? req.getRole() : Role.STUDENT;

        // Security violation: Public registration cannot create ADMINs
        if (role == Role.ADMIN) {
            throw new IllegalStateException("Direct registration of Administrators is not permitted.");
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .campusEmail(req.getCampusEmail())
                .campusId(req.getCampusId())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .failedAttempts(0)
                .build();

        user = userRepository.save(user);

        // Audit Log for Registration
        auditService.log(user.getId(), "REGISTER", "New user registered: " + user.getCampusId() + " (" + role + ")");

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getCampusId());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .campusEmail(user.getCampusEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole().name())
                        .campusId(user.getCampusId())
                        .build())
                .build();
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByCampusId(req.getCampusId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with Campus ID: " + req.getCampusId()));

        // Pre-auth checks
        if (user.getStatus() == UserStatus.LOCKED) {
            auditService.log(user.getId(), "LOGIN_BLOCKED", "Attempt to login to LOCKED account");
            throw new IllegalStateException("Your account is LOCKED due to multiple failed login attempts. Please contact an Administrator.");
        }
        
        if (user.getStatus() == UserStatus.DISABLED) {
            auditService.log(user.getId(), "LOGIN_BLOCKED", "Attempt to login to DISABLED account");
            throw new IllegalStateException("Your account is DISABLED. Please contact Support.");
        }

        try {
            // Attempt authentication using campusId as username
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getCampusId(), req.getPassword())
            );

            // SUCCESS: Reset indicators
            user.setFailedAttempts(0);
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Audit Success
            auditService.log(user.getId(), "LOGIN_SUCCESS", "User " + user.getCampusId() + " authenticated successfully");

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getCampusId());
            String token = jwtUtil.generateToken(userDetails, user.getRole().name());

            return AuthResponse.builder()
                    .token(token)
                    .user(AuthResponse.UserInfo.builder()
                            .id(user.getId())
                            .campusEmail(user.getCampusEmail())
                            .fullName(user.getFullName())
                            .role(user.getRole().name())
                            .campusId(user.getCampusId())
                            .build())
                    .build();

        } catch (BadCredentialsException e) {
            // FAILURE: Manage attempts
            int currentAttempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(currentAttempts);

            String auditDetails = "Invalid password attempt #" + currentAttempts;

            if (currentAttempts >= 3) {
                user.setStatus(UserStatus.LOCKED);
                auditDetails += " | ACCOUNT AUTO-LOCKED";
                
                // Alert all Admins
                notificationService.notifyAdmins(
                    "Security Alert: Account Locked 🔒",
                    "User " + user.getCampusId() + " has been locked due to 3 failed attempts.",
                    NotificationType.SYSTEM,
                    NotificationPriority.HIGH
                );
            }

            userRepository.save(user);
            
            // Audit Failure
            auditService.log(user.getId(), "LOGIN_FAILED", auditDetails);

            if (currentAttempts >= 3) {
                throw new IllegalStateException("Too many failed attempts. Your account has been LOCKED for security.");
            } else {
                throw new IllegalArgumentException("Invalid password. Remaining attempts: " + (3 - currentAttempts));
            }
        }
    }
}
