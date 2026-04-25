package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.Booking;
import com.smartcampus.model.NotificationType;
import com.smartcampus.model.NotificationPriority;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.service.NotificationService;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    // ── HELPER — Build location string ─────────────────
    private String sanitize(String html) {
        if (html == null)
            return null;
        return html.replaceAll("<[^>]*>", ""); // Basic XSS protection
    }

    private String buildLocation(String building,
            Integer floor, String roomNumber) {
        return building + ", Floor " + floor
                + ", Room " + roomNumber;
    }

    // ── HELPER — Map Resource to ResponseDTO ───────────
    private ResourceResponseDTO toDTO(Resource resource) {
        return ResourceResponseDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .description(resource.getDescription())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .building(resource.getBuilding())
                .floor(resource.getFloor())
                .roomNumber(resource.getRoomNumber())
                .location(resource.getLocation())
                .status(resource.getStatus())
                .equipment(resource.getEquipment())
                .imageUrls(resource.getImageUrls())
                .availability(resource.getAvailability())

                .assignedStaffId(resource.getAssignedStaffId())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }

    // ── HELPER — Map Resource to Summary ResponseDTO (Single Image) ─────
    private ResourceResponseDTO toSummaryDTO(Resource resource) {
        ResourceResponseDTO dto = toDTO(resource);
        if (dto.getImageUrls() != null && dto.getImageUrls().size() > 1) {
            // Keep only the first image for the list view to improve performance
            dto.setImageUrls(Collections.singletonList(dto.getImageUrls().get(0)));
        }
        return dto;
    }

    // ── GET ALL WITH FILTERS (PAF Dynamic Search) ───────
    public List<ResourceResponseDTO> getResources(
            String building, Integer floor,
            ResourceType type, ResourceStatus status,
            Integer capacity, String name) {

        Query query = new Query();

        if (building != null && !building.trim().isEmpty()) {
            query.addCriteria(Criteria.where("building").is(building));
        }
        if (floor != null) {
            query.addCriteria(Criteria.where("floor").is(floor));
        }
        if (type != null) {
            query.addCriteria(Criteria.where("type").is(type));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (capacity != null) {
            query.addCriteria(Criteria.where("capacity").gte(capacity));
        }
        if (name != null && !name.trim().isEmpty()) {
            // Regex for case-insensitive start-with search
            query.addCriteria(Criteria.where("name").regex("^" + java.util.regex.Pattern.quote(name.trim()), "i"));
        }

        List<Resource> results = mongoTemplate.find(query, Resource.class);

        return results.stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    // ── GET SINGLE RESOURCE ─────────────────────────────
    public ResourceResponseDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        return toDTO(resource);
    }

    // ── GET BUILDINGS ───────────────────────────────────
    public List<String> getBuildings() {
        return mongoTemplate.getCollection("resources")
                .distinct("building", String.class)
                .into(new java.util.ArrayList<>())
                .stream()
                .filter(Objects::nonNull)
                .sorted()
                .collect(Collectors.toList());
    }

    // ── GET FLOORS BY BUILDING ──────────────────────────
    public List<Integer> getFloorsByBuilding(String building) {
        return resourceRepository.findByBuilding(building)
                .stream()
                .map(Resource::getFloor)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }


    // ── GET FLOOR MAP ───────────────────────────────────
    public List<ResourceResponseDTO> getFloorMap(String building, Integer floor) {
        return resourceRepository.findByBuildingAndFloorOrderByRoomNumber(building, floor)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    // ── ANALYTICS SUMMARY ───────────────────────────────
    public Map<String, Object> getAnalyticsSummary() {
        long totalResources = resourceRepository.count();
        long active = resourceRepository.countByStatus(ResourceStatus.ACTIVE);
        long maintenance = resourceRepository.countByStatus(ResourceStatus.MAINTENANCE);
        long outOfService = resourceRepository.countByStatus(ResourceStatus.OUT_OF_SERVICE);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalResources", totalResources);
        summary.put("activeResources", active);
        summary.put("maintenanceResources", maintenance);
        summary.put("outOfServiceResources", outOfService);
        
        // Distribution (Simplified for performance - would normally use Mongo Aggregation)
        // For now, these are still relatively safe if not called 1000x a second
        summary.put("distributionByBuilding", new HashMap<>()); 
        summary.put("peakBookingHours", new HashMap<>());
        summary.put("mostBooked", new ArrayList<>());
        
        return summary;
    }

    // ── CREATE ──────────────────────────────────────────
    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
             throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Resource name is required.");
        }
        
        if (resourceRepository.findByName(dto.getName()).isPresent()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "A facility with the name '" + dto.getName() + "' already exists.");
        }

        validateBuildingLimits(dto.getBuilding(), dto.getFloor());

        Resource resource = Resource.builder()
                .name(sanitize(dto.getName()))
                .description(sanitize(dto.getDescription()))
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .building(dto.getBuilding())
                .floor(dto.getFloor())
                .roomNumber(dto.getRoomNumber())
                .location(buildLocation(dto.getBuilding(), dto.getFloor(), dto.getRoomNumber()))
                .status(dto.getStatus() != null ? dto.getStatus() : ResourceStatus.ACTIVE)
                .equipment(dto.getEquipment())
                .imageUrls(dto.getImageUrls())
                .availability(dto.getAvailability())
                .assignedStaffId(dto.getAssignedStaffId())
                .build();

        Resource finalSaved = resourceRepository.save(resource);

        try {
            notificationService.notifyAdmins(
                    "Facility Added: " + finalSaved.getName(),
                    "Location: " + finalSaved.getLocation(),
                    NotificationType.SYSTEM,
                    NotificationPriority.MEDIUM);
        } catch (Exception e) {
        }

        return toDTO(finalSaved);
    }

    // ── UPDATE ──────────────────────────────────────────
    public ResourceResponseDTO updateResource(String id, ResourceRequestDTO dto) {
        validateBuildingLimits(dto.getBuilding(), dto.getFloor());

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        if (dto.getName() != null && !dto.getName().equals(resource.getName())) {
            if (resourceRepository.findByName(dto.getName()).isPresent()) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Cannot rename: Name '" + dto.getName() + "' already taken.");
            }
        }

        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setBuilding(dto.getBuilding());
        resource.setFloor(dto.getFloor());
        resource.setRoomNumber(dto.getRoomNumber());
        resource.setStatus(dto.getStatus() != null ? dto.getStatus() : resource.getStatus());
        resource.setLocation(buildLocation(dto.getBuilding(), dto.getFloor(), dto.getRoomNumber()));
        resource.setEquipment(dto.getEquipment());
        resource.setImageUrls(dto.getImageUrls());
        resource.setAvailability(dto.getAvailability());
        resource.setAssignedStaffId(dto.getAssignedStaffId());

        resource.setUpdatedAt(LocalDateTime.now());

        Resource updated = resourceRepository.save(resource);

        try {
            notificationService.notifyAdmins(
                    "Facility Updated: " + updated.getName(),
                    "Details for " + updated.getName() + " modified.",
                    NotificationType.SYSTEM,
                    NotificationPriority.MEDIUM);
        } catch (Exception e) {
        }

        return toDTO(updated);
    }

    // ── STATUS CHANGE ───────────────────────────────────
    public ResourceResponseDTO updateStatus(String id, ResourceStatus newStatus) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        resource.setStatus(newStatus);
        resource.setUpdatedAt(LocalDateTime.now());
        Resource updated = resourceRepository.save(resource);

        try {
            notificationService.notifyAdmins(
                    "Status Alert: " + resource.getName(),
                    "Marked as " + newStatus,
                    NotificationType.SYSTEM,
                    NotificationPriority.HIGH);
        } catch (Exception e) {
        }

        return toDTO(updated);
    }

    // ── DELETE ──────────────────────────────────────────
    public void deleteResource(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        resourceRepository.delete(resource);
    }

    private void validateBuildingLimits(String building, Integer floor) {
        if (building == null || floor == null) return;

        String b = building.toUpperCase();
        if (b.equals("MAIN BUILDING") && floor > 7) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Main Building only has floors up to 7.");
        }
        if ((b.contains("F BLOCK") || b.contains("G BLOCK")) && floor > 14) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "New Buildings F/G Block only have floors up to 14.");
        }
        if (b.equals("SPORTS COMPLEX") && floor > 2) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Sports Complex only has floors up to 2.");
        }
        if (floor < 0) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid floor number.");
        }
    }

    @EventListener(ContextRefreshedEvent.class)
    public void syncFacilitiesOnStartup() {
        try {
            List<Resource> all = resourceRepository.findAll();
            if (all.isEmpty())
                return;
            notificationService.notifyAdmins(
                    "Sync Complete",
                    all.size() + " resources indexed.",
                    NotificationType.SYSTEM,
                    NotificationPriority.LOW);
        } catch (Exception e) {
        }
    }
}
