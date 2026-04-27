package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    private ResourceType type;

    private Integer capacity;

    @Indexed
    private String building; // "New Building" / "Main Building"

    private Integer floor;

    private String roomNumber;

    private String location;

    @Indexed
    private ResourceStatus status = ResourceStatus.ACTIVE;

    private List<String> equipment;

    private List<String> imageUrls;

    private List<DayAvailability> availability;

    @Indexed
    private List<String> assignedStaffIds;

    @Indexed
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public Resource() {
    }

    public Resource(String id, String name, String description, ResourceType type, Integer capacity, String building, Integer floor, String roomNumber, String location, ResourceStatus status, List<String> equipment, List<String> imageUrls, List<DayAvailability> availability, List<String> assignedStaffIds, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.capacity = capacity;
        this.building = building;
        this.floor = floor;
        this.roomNumber = roomNumber;
        this.location = location;
        this.status = status != null ? status : ResourceStatus.ACTIVE;
        this.equipment = equipment;
        this.imageUrls = imageUrls;
        this.availability = availability;
        this.assignedStaffIds = assignedStaffIds;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Resource resource = (Resource) o;
        return Objects.equals(id, resource.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Resource{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", building='" + building + '\'' +
                ", status=" + status +
                '}';
    }

    public static ResourceBuilder builder() {
        return new ResourceBuilder();
    }

    public static class ResourceBuilder {
        private String id;
        private String name;
        private String description;
        private ResourceType type;
        private Integer capacity;
        private String building;
        private Integer floor;
        private String roomNumber;
        private String location;
        private ResourceStatus status = ResourceStatus.ACTIVE;
        private List<String> equipment;
        private List<String> imageUrls;
        private List<DayAvailability> availability;
        private List<String> assignedStaffIds;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        ResourceBuilder() {}

        public ResourceBuilder id(String id) { this.id = id; return this; }
        public ResourceBuilder name(String name) { this.name = name; return this; }
        public ResourceBuilder description(String description) { this.description = description; return this; }
        public ResourceBuilder type(ResourceType type) { this.type = type; return this; }
        public ResourceBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public ResourceBuilder building(String building) { this.building = building; return this; }
        public ResourceBuilder floor(Integer floor) { this.floor = floor; return this; }
        public ResourceBuilder roomNumber(String roomNumber) { this.roomNumber = roomNumber; return this; }
        public ResourceBuilder location(String location) { this.location = location; return this; }
        public ResourceBuilder status(ResourceStatus status) { this.status = status; return this; }
        public ResourceBuilder equipment(List<String> equipment) { this.equipment = equipment; return this; }
        public ResourceBuilder imageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; return this; }
        public ResourceBuilder availability(List<DayAvailability> availability) { this.availability = availability; return this; }
        public ResourceBuilder assignedStaffIds(List<String> assignedStaffIds) { this.assignedStaffIds = assignedStaffIds; return this; }
        public ResourceBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ResourceBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Resource build() {
            return new Resource(id, name, description, type, capacity, building, floor, roomNumber, location, status, equipment, imageUrls, availability, assignedStaffIds, createdAt, updatedAt);
        }
    }
}
