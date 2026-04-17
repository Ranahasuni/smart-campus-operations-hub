package com.smartcampus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    
    private final String resourceId;

    public ResourceNotFoundException(String id) {
        super(String.format("Facility not found with ID: '%s'. It may have been decommissioned or moved.", id));
        this.resourceId = id;
    }

    public String getResourceId() {
        return resourceId;
    }
}
