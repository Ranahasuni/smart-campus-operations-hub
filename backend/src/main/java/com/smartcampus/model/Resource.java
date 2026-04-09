package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    private String id;

    private String name;

    private String description;

    private ResourceType type;

    private Integer capacity;

    private String building; // "New Building" / "Main Building"

    private Integer floor;

    private String roomNumber;

    private String location;

    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    private List<String> equipment;

    private List<String> imageUrls;

    private List<DayAvailability> availability;

    private String qrCodeUrl;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}
