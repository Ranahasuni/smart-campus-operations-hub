package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Request body for POST /auth/login */
@Data
public class LoginRequest {

    @NotBlank
    private String campusId;

    @NotBlank
    private String password;
}
