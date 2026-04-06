package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed
    private String name;

    @Indexed(unique = true)
    private String email;

    /** BCrypt-hashed password */
    private String password;

    @Builder.Default
    private Role role = Role.STUDENT;

    /** For Google OAuth2 sign-in */
    private String googleId;
}
