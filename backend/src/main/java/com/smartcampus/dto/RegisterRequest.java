package com.smartcampus.dto;

import com.smartcampus.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Request body for POST /auth/register */
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Must be a valid campus email")
    @NotBlank(message = "Campus email is required")
    private String campusEmail;

    @NotBlank(message = "Campus ID is required")
    private String campusId; // student ID / lecturer ID / admin ID

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    /** Optional – defaults to STUDENT if omitted */
    private Role role;

    public RegisterRequest() {
    }

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCampusEmail() { return campusEmail; }
    public void setCampusEmail(String campusEmail) { this.campusEmail = campusEmail; }

    public String getCampusId() { return campusId; }
    public void setCampusId(String campusId) { this.campusId = campusId; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
