package com.smartcampus.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class DayAvailability {
    private String day; // "Mon", "Tue", etc.
    
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    
    private List<TimeSlot> slots;

    public DayAvailability() {
    }

    public DayAvailability(String day, boolean isAvailable, List<TimeSlot> slots) {
        this.day = day;
        this.isAvailable = isAvailable;
        this.slots = slots;
    }

    // Getters and Setters
    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    @JsonProperty("isAvailable")
    public boolean isAvailable() { return isAvailable; }
    @JsonProperty("isAvailable")
    public void setAvailable(boolean available) { isAvailable = available; }

    public List<TimeSlot> getSlots() { return slots; }
    public void setSlots(List<TimeSlot> slots) { this.slots = slots; }

    public static DayAvailabilityBuilder builder() {
        return new DayAvailabilityBuilder();
    }

    public static class DayAvailabilityBuilder {
        private String day;
        private boolean isAvailable;
        private List<TimeSlot> slots;

        DayAvailabilityBuilder() {}

        public DayAvailabilityBuilder day(String day) { this.day = day; return this; }
        public DayAvailabilityBuilder isAvailable(boolean isAvailable) { this.isAvailable = isAvailable; return this; }
        public DayAvailabilityBuilder slots(List<TimeSlot> slots) { this.slots = slots; return this; }

        public DayAvailability build() {
            return new DayAvailability(day, isAvailable, slots);
        }
    }
}
