package com.smartcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.check-in")
public class CheckInProperties {
    /** Buffer minutes allowed before the booking start time for QR scanning. */
    private int scanBufferMinutes = 15;
    
    /** Buffer minutes allowed before the booking start time for manual check-in reporting. */
    private int manualBufferMinutes = 10;

    public CheckInProperties() {
    }

    // Getters and Setters
    public int getScanBufferMinutes() { return scanBufferMinutes; }
    public void setScanBufferMinutes(int scanBufferMinutes) { this.scanBufferMinutes = scanBufferMinutes; }

    public int getManualBufferMinutes() { return manualBufferMinutes; }
    public void setManualBufferMinutes(int manualBufferMinutes) { this.manualBufferMinutes = manualBufferMinutes; }
}
