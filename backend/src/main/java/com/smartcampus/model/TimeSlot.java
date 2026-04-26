package com.smartcampus.model;

public class TimeSlot {
    private String startTime;
    private String endTime;

    public TimeSlot() {
    }

    public TimeSlot(String startTime, String endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public static TimeSlotBuilder builder() {
        return new TimeSlotBuilder();
    }

    public static class TimeSlotBuilder {
        private String startTime;
        private String endTime;

        TimeSlotBuilder() {}

        public TimeSlotBuilder startTime(String startTime) { this.startTime = startTime; return this; }
        public TimeSlotBuilder endTime(String endTime) { this.endTime = endTime; return this; }

        public TimeSlot build() {
            return new TimeSlot(startTime, endTime);
        }
    }
}
