package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100, message = "Resource name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    private String description;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 1000, message = "Capacity cannot exceed 1000")
    private Integer capacity;

    @NotBlank(message = "Building is required")
    private String building;

    @NotNull(message = "Floor is required")
    @Min(value = 0, message = "Floor cannot be negative")
    private Integer floor;

    @NotBlank(message = "Room number is required")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "Room number must use uppercase letters and numbers. Hyphens are allowed (e.g., A405, AUD-01).")
    private String roomNumber;

    private ResourceStatus status;

    @NotEmpty(message = "Please list at least one feature or piece of equipment")
    private List<String> equipment;

    @NotEmpty(message = "At least one image is required")
    @Size(max = 5, message = "You can only upload a maximum of 5 images")
    private List<String> imageUrls;

    @NotEmpty(message = "Operational Status: You must enable at least one operational day")
    private List<com.smartcampus.model.DayAvailability> availability;

    private List<String> assignedStaffIds;
}
