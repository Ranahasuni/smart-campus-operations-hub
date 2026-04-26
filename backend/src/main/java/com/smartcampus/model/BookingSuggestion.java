package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "booking_suggestions")
public class BookingSuggestion {

    @Id
    private String id;

    private String resourceId;

    private LocalDate recommendedDate;

    private LocalTime recommendedStartTime;

    private LocalTime recommendedEndTime;

    private String reason; // e.g. "Available adjacent to requested time"

    public BookingSuggestion() {
    }

    public BookingSuggestion(String id, String resourceId, LocalDate recommendedDate, LocalTime recommendedStartTime, LocalTime recommendedEndTime, String reason) {
        this.id = id;
        this.resourceId = resourceId;
        this.recommendedDate = recommendedDate;
        this.recommendedStartTime = recommendedStartTime;
        this.recommendedEndTime = recommendedEndTime;
        this.reason = reason;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public LocalDate getRecommendedDate() { return recommendedDate; }
    public void setRecommendedDate(LocalDate recommendedDate) { this.recommendedDate = recommendedDate; }

    public LocalTime getRecommendedStartTime() { return recommendedStartTime; }
    public void setRecommendedStartTime(LocalTime recommendedStartTime) { this.recommendedStartTime = recommendedStartTime; }

    public LocalTime getRecommendedEndTime() { return recommendedEndTime; }
    public void setRecommendedEndTime(LocalTime recommendedEndTime) { this.recommendedEndTime = recommendedEndTime; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public static BookingSuggestionBuilder builder() {
        return new BookingSuggestionBuilder();
    }

    public static class BookingSuggestionBuilder {
        private String id;
        private String resourceId;
        private LocalDate recommendedDate;
        private LocalTime recommendedStartTime;
        private LocalTime recommendedEndTime;
        private String reason;

        BookingSuggestionBuilder() {}

        public BookingSuggestionBuilder id(String id) { this.id = id; return this; }
        public BookingSuggestionBuilder resourceId(String resourceId) { this.resourceId = resourceId; return this; }
        public BookingSuggestionBuilder recommendedDate(LocalDate recommendedDate) { this.recommendedDate = recommendedDate; return this; }
        public BookingSuggestionBuilder recommendedStartTime(LocalTime recommendedStartTime) { this.recommendedStartTime = recommendedStartTime; return this; }
        public BookingSuggestionBuilder recommendedEndTime(LocalTime recommendedEndTime) { this.recommendedEndTime = recommendedEndTime; return this; }
        public BookingSuggestionBuilder reason(String reason) { this.reason = reason; return this; }

        public BookingSuggestion build() {
            return new BookingSuggestion(id, resourceId, recommendedDate, recommendedStartTime, recommendedEndTime, reason);
        }
    }
}
