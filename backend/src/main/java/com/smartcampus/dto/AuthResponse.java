package com.smartcampus.dto;

/** Response body returned by /auth/login and /auth/register */
public class AuthResponse {
    private String token;
    private UserInfo user;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserInfo user) {
        this.token = token;
        this.user = user;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private UserInfo user;

        AuthResponseBuilder() {}

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder user(UserInfo user) { this.user = user; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, user);
        }
    }

    public static class UserInfo {
        private String id;
        private String campusEmail;
        private String fullName;
        private String role;
        private String campusId;

        public UserInfo() {
        }

        public UserInfo(String id, String campusEmail, String fullName, String role, String campusId) {
            this.id = id;
            this.campusEmail = campusEmail;
            this.fullName = fullName;
            this.role = role;
            this.campusId = campusId;
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getCampusEmail() { return campusEmail; }
        public void setCampusEmail(String campusEmail) { this.campusEmail = campusEmail; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getCampusId() { return campusId; }
        public void setCampusId(String campusId) { this.campusId = campusId; }

        public static UserInfoBuilder builder() {
            return new UserInfoBuilder();
        }

        public static class UserInfoBuilder {
            private String id;
            private String campusEmail;
            private String fullName;
            private String role;
            private String campusId;

            UserInfoBuilder() {}

            public UserInfoBuilder id(String id) { this.id = id; return this; }
            public UserInfoBuilder campusEmail(String campusEmail) { this.campusEmail = campusEmail; return this; }
            public UserInfoBuilder fullName(String fullName) { this.fullName = fullName; return this; }
            public UserInfoBuilder role(String role) { this.role = role; return this; }
            public UserInfoBuilder campusId(String campusId) { this.campusId = campusId; return this; }

            public UserInfo build() {
                return new UserInfo(id, campusEmail, fullName, role, campusId);
            }
        }
    }
}
