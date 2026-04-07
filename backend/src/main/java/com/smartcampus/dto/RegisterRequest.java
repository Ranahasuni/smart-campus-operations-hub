package com.smartcampus.dto;

import com.smartcampus.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** Request body for POST /auth/register */
@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Must be a valid campus email")
    @NotBlank(message = "Campus email is required")
    private String campusEmail;

    @NotBlank(message = "Campus ID is required")
    private String campusId; // student ID / lecturer ID / admin ID

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    /** Optional – defaults to STUDENT if omitted */
    private Role role;
}
