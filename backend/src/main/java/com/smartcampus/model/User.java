package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Enhanced User model to support advanced security features like account locking,
 * login attempts tracking, and audit logging.
 */
@Document(collection = "users")
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

    private Role role = Role.STUDENT;

    @Indexed
    private UserStatus status = UserStatus.ACTIVE;

    private int failedAttempts = 0;

    private LocalDateTime lockoutUntil;

    private LocalDateTime lastLogin;

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {
    }

    public User(String id, String campusId, String fullName, String campusEmail, String password, Role role, UserStatus status, int failedAttempts, LocalDateTime lockoutUntil, LocalDateTime lastLogin, LocalDateTime createdAt) {
        this.id = id;
        this.campusId = campusId;
        this.fullName = fullName;
        this.campusEmail = campusEmail;
        this.password = password;
        this.role = role != null ? role : Role.STUDENT;
        this.status = status != null ? status : UserStatus.ACTIVE;
        this.failedAttempts = failedAttempts;
        this.lockoutUntil = lockoutUntil;
        this.lastLogin = lastLogin;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCampusId() { return campusId; }
    public void setCampusId(String campusId) { this.campusId = campusId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCampusEmail() { return campusEmail; }
    public void setCampusEmail(String campusEmail) { this.campusEmail = campusEmail; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }

    public LocalDateTime getLockoutUntil() { return lockoutUntil; }
    public void setLockoutUntil(LocalDateTime lockoutUntil) { this.lockoutUntil = lockoutUntil; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", campusId='" + campusId + '\'' +
                ", fullName='" + fullName + '\'' +
                ", campusEmail='" + campusEmail + '\'' +
                ", role=" + role +
                ", status=" + status +
                '}';
    }

    // Manual Builder for compatibility
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private String id;
        private String campusId;
        private String fullName;
        private String campusEmail;
        private String password;
        private Role role = Role.STUDENT;
        private UserStatus status = UserStatus.ACTIVE;
        private int failedAttempts = 0;
        private LocalDateTime lockoutUntil;
        private LocalDateTime lastLogin;
        private LocalDateTime createdAt = LocalDateTime.now();

        UserBuilder() {}

        public UserBuilder id(String id) { this.id = id; return this; }
        public UserBuilder campusId(String campusId) { this.campusId = campusId; return this; }
        public UserBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserBuilder campusEmail(String campusEmail) { this.campusEmail = campusEmail; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder status(UserStatus status) { this.status = status; return this; }
        public UserBuilder failedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; return this; }
        public UserBuilder lockoutUntil(LocalDateTime lockoutUntil) { this.lockoutUntil = lockoutUntil; return this; }
        public UserBuilder lastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            return new User(id, campusId, fullName, campusEmail, password, role, status, failedAttempts, lockoutUntil, lastLogin, createdAt);
        }
    }
}
