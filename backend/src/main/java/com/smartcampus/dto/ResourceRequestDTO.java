package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Building is required")
    private String building;

    @NotNull(message = "Floor is required")
    private Integer floor;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    private ResourceStatus status;

    private List<String> equipment;

    private List<String> imageUrls;

    @NotBlank(message = "Available from is required")
    private String availableFrom;

    @NotBlank(message = "Available to is required")
    private String availableTo;

    private List<String> availableDays;
}
