package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DayAvailability {
    private String day; // "Mon", "Tue", etc.
    private boolean isAvailable;
    private java.util.List<TimeSlot> slots;

}
