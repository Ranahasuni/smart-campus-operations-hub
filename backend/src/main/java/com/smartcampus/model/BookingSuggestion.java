package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "booking_suggestions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSuggestion {

    @Id
    private String id;

    private String resourceId;

    private LocalDate recommendedDate;

    private LocalTime recommendedStartTime;

    private LocalTime recommendedEndTime;

    private String reason; // e.g. "Available adjacent to requested time"
}
