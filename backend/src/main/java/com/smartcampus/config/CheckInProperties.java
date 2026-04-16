package com.smartcampus.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.check-in")
@Data
public class CheckInProperties {
    /** Buffer minutes allowed before the booking start time for QR scanning. */
    private int scanBufferMinutes = 15;
    
    /** Buffer minutes allowed before the booking start time for manual check-in reporting. */
    private int manualBufferMinutes = 10;
}
