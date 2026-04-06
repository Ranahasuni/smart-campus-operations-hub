package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/** Response body returned by /auth/login and /auth/register */
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private String role;
    private String userId; // Changed from Long to String
}
