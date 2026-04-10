package com.smartcampus.model;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    
    private java.util.List<TimeSlot> slots;

}
