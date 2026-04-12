package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResourceSummaryDTO {
    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String building;
    private Integer floor;
    private String roomNumber;
    private ResourceStatus status;
    private String thumbnail; // First image only
}
