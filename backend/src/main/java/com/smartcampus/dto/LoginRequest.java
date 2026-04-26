package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

/** Request body for POST /auth/login */
public class LoginRequest {

    @NotBlank
    private String campusId;

    @NotBlank
    private String password;

    public LoginRequest() {
    }

    // Getters and Setters
    public String getCampusId() { return campusId; }
    public void setCampusId(String campusId) { this.campusId = campusId; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
