package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Enhanced User model to support advanced security features like account locking,
 * login attempts tracking, and audit logging.
 */
@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String campusId; // student ID / lecturer ID / admin ID

    private String fullName;

    @Indexed(unique = true)
    private String campusEmail;

    /** BCrypt-hashed password */
    private String password;

    @Builder.Default
    private Role role = Role.STUDENT;

    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Builder.Default
    private int failedAttempts = 0;

    private LocalDateTime lastLogin;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
