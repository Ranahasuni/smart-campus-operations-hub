package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "comments")
public class Comment {

    @Id
    private String id;

    private String ticketId;
    private String userId;
    private String userFullName;
    private String userCampusId;

    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public Comment() {
    }

    public Comment(String id, String ticketId, String userId, String userFullName, String userCampusId, String message, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.userId = userId;
        this.userFullName = userFullName;
        this.userCampusId = userCampusId;
        this.message = message;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserCampusId() { return userCampusId; }
    public void setUserCampusId(String userCampusId) { this.userCampusId = userCampusId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static CommentBuilder builder() {
        return new CommentBuilder();
    }

    public static class CommentBuilder {
        private String id;
        private String ticketId;
        private String userId;
        private String userFullName;
        private String userCampusId;
        private String message;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        CommentBuilder() {}

        public CommentBuilder id(String id) { this.id = id; return this; }
        public CommentBuilder ticketId(String ticketId) { this.ticketId = ticketId; return this; }
        public CommentBuilder userId(String userId) { this.userId = userId; return this; }
        public CommentBuilder userFullName(String userFullName) { this.userFullName = userFullName; return this; }
        public CommentBuilder userCampusId(String userCampusId) { this.userCampusId = userCampusId; return this; }
        public CommentBuilder message(String message) { this.message = message; return this; }
        public CommentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CommentBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Comment build() {
            return new Comment(id, ticketId, userId, userFullName, userCampusId, message, createdAt, updatedAt);
        }
    }
}
