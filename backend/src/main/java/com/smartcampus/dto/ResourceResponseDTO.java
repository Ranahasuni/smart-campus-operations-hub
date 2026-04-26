package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.DayAvailability;

import java.time.LocalDateTime;
import java.util.List;

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
    private List<DayAvailability> availability;
    private List<String> assignedStaffIds;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ResourceResponseDTO() {
    }

    public ResourceResponseDTO(String id, String name, String description, ResourceType type, Integer capacity, String building, Integer floor, String roomNumber, String location, ResourceStatus status, List<String> equipment, List<String> imageUrls, List<DayAvailability> availability, List<String> assignedStaffIds, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.capacity = capacity;
        this.building = building;
        this.floor = floor;
        this.roomNumber = roomNumber;
        this.location = location;
        this.status = status;
        this.equipment = equipment;
        this.imageUrls = imageUrls;
        this.availability = availability;
        this.assignedStaffIds = assignedStaffIds;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ResourceResponseDTOBuilder builder() {
        return new ResourceResponseDTOBuilder();
    }

    public static class ResourceResponseDTOBuilder {
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
        private List<DayAvailability> availability;
        private List<String> assignedStaffIds;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        ResourceResponseDTOBuilder() {}

        public ResourceResponseDTOBuilder id(String id) { this.id = id; return this; }
        public ResourceResponseDTOBuilder name(String name) { this.name = name; return this; }
        public ResourceResponseDTOBuilder description(String description) { this.description = description; return this; }
        public ResourceResponseDTOBuilder type(ResourceType type) { this.type = type; return this; }
        public ResourceResponseDTOBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public ResourceResponseDTOBuilder building(String building) { this.building = building; return this; }
        public ResourceResponseDTOBuilder floor(Integer floor) { this.floor = floor; return this; }
        public ResourceResponseDTOBuilder roomNumber(String roomNumber) { this.roomNumber = roomNumber; return this; }
        public ResourceResponseDTOBuilder location(String location) { this.location = location; return this; }
        public ResourceResponseDTOBuilder status(ResourceStatus status) { this.status = status; return this; }
        public ResourceResponseDTOBuilder equipment(List<String> equipment) { this.equipment = equipment; return this; }
        public ResourceResponseDTOBuilder imageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; return this; }
        public ResourceResponseDTOBuilder availability(List<DayAvailability> availability) { this.availability = availability; return this; }
        public ResourceResponseDTOBuilder assignedStaffIds(List<String> assignedStaffIds) { this.assignedStaffIds = assignedStaffIds; return this; }
        public ResourceResponseDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ResourceResponseDTOBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ResourceResponseDTO build() {
            return new ResourceResponseDTO(id, name, description, type, capacity, building, floor, roomNumber, location, status, equipment, imageUrls, availability, assignedStaffIds, createdAt, updatedAt);
        }
    }
}
