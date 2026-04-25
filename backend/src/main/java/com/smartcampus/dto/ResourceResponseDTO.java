package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ResourceResponseDTO {

    private String id;
    private String name;
    private String description;
    private ResourceType type;
    private Integer capacity;
    private String building;
    private Integer floor;
    private String roomNumber;
    private String location;
    private ResourceStatus status;
    private List<String> equipment;
    private List<String> imageUrls;
    private List<com.smartcampus.model.DayAvailability> availability;
    private List<String> assignedStaffIds;


    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
