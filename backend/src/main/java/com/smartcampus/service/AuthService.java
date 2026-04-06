package com.smartcampus.service;

import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.dto.RegisterRequest;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles registration and login (MongoDB implementation).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtil               jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsService    userDetailsService;

    // ── Register ─────────────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered: " + req.getEmail());
        }

        Role role = (req.getRole() != null) ? req.getRole() : Role.STUDENT;

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .build();

        user = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return new AuthResponse(token, user.getEmail(), user.getName(),
                user.getRole().name(), user.getId());
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest req) {
        // This will throw BadCredentialsException if wrong
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return new AuthResponse(token, user.getEmail(), user.getName(),
                user.getRole().name(), user.getId());
    }
}
