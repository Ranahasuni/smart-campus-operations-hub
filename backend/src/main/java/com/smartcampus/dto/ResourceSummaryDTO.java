package com.smartcampus.dto;

import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;

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

    public ResourceSummaryDTO() {
    }

    public ResourceSummaryDTO(String id, String name, ResourceType type, Integer capacity, String building, Integer floor, String roomNumber, ResourceStatus status, String thumbnail) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.building = building;
        this.floor = floor;
        this.roomNumber = roomNumber;
        this.status = status;
        this.thumbnail = thumbnail;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public static ResourceSummaryDTOBuilder builder() {
        return new ResourceSummaryDTOBuilder();
    }

    public static class ResourceSummaryDTOBuilder {
        private String id;
        private String name;
        private ResourceType type;
        private Integer capacity;
        private String building;
        private Integer floor;
        private String roomNumber;
        private ResourceStatus status;
        private String thumbnail;

        ResourceSummaryDTOBuilder() {}

        public ResourceSummaryDTOBuilder id(String id) { this.id = id; return this; }
        public ResourceSummaryDTOBuilder name(String name) { this.name = name; return this; }
        public ResourceSummaryDTOBuilder type(ResourceType type) { this.type = type; return this; }
        public ResourceSummaryDTOBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public ResourceSummaryDTOBuilder building(String building) { this.building = building; return this; }
        public ResourceSummaryDTOBuilder floor(Integer floor) { this.floor = floor; return this; }
        public ResourceSummaryDTOBuilder roomNumber(String roomNumber) { this.roomNumber = roomNumber; return this; }
        public ResourceSummaryDTOBuilder status(ResourceStatus status) { this.status = status; return this; }
        public ResourceSummaryDTOBuilder thumbnail(String thumbnail) { this.thumbnail = thumbnail; return this; }

        public ResourceSummaryDTO build() {
            return new ResourceSummaryDTO(id, name, type, capacity, building, floor, roomNumber, status, thumbnail);
        }
    }
}
