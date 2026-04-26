package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.DayAvailability;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

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
    private List<DayAvailability> availability;

    @NotEmpty(message = "Administrative Requirement: You must assign at least one staff member as a caretaker")
    private List<String> assignedStaffIds;

    public ResourceRequestDTO() {
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public ResourceStatus getStatus() { return status; }
    public void setStatus(ResourceStatus status) { this.status = status; }

    public List<String> getEquipment() { return equipment; }
    public void setEquipment(List<String> equipment) { this.equipment = equipment; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public List<DayAvailability> getAvailability() { return availability; }
    public void setAvailability(List<DayAvailability> availability) { this.availability = availability; }

    public List<String> getAssignedStaffIds() { return assignedStaffIds; }
    public void setAssignedStaffIds(List<String> assignedStaffIds) { this.assignedStaffIds = assignedStaffIds; }
}
