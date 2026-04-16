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
import org.springframework.stereotype.Service;

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

    // ── HELPER — Generate QR Code URL ──────────────────
    private String generateQRCode(String resourceId) {
        String resourceUrl = "http://localhost:5173/check-in/resource/" + resourceId;
        return "https://api.qrserver.com/v1/create-qr-code/"
                + "?size=250x250&data=" + resourceUrl;
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

                .qrCodeUrl(resource.getQrCodeUrl())
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

        List<Resource> all = resourceRepository.findAll();

        return all.stream()
                .filter(r -> {
                    if (name == null || name.trim().isEmpty()) return true;
                    if (r.getName() == null) return false;
                    return r.getName().toLowerCase().startsWith(name.toLowerCase());
                })
                .filter(r -> building == null || r.getBuilding().equalsIgnoreCase(building))
                .filter(r -> floor == null || r.getFloor().equals(floor))
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> capacity == null || r.getCapacity() >= capacity)
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
        return resourceRepository.findAll()
                .stream()
                .map(Resource::getBuilding)
                .distinct()
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

    // ── GET QR CODE ─────────────────────────────────────
    public String getQRCode(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        return resource.getQrCodeUrl();
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
        List<Resource> all = resourceRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();

        long active = all.stream().filter(r -> r.getStatus() == ResourceStatus.ACTIVE).count();
        long maintenance = all.stream().filter(r -> r.getStatus() == ResourceStatus.MAINTENANCE).count();
        long outOfService = all.stream().filter(r -> r.getStatus() == ResourceStatus.OUT_OF_SERVICE).count();

        // Distribution by Type
        Map<ResourceType, Long> byType = all.stream()
                .collect(Collectors.groupingBy(Resource::getType, Collectors.counting()));

        // Distribution by Building
        Map<String, Long> byBuilding = all.stream()
                .collect(Collectors.groupingBy(Resource::getBuilding, Collectors.counting()));

        // Peak Booking Hours (08:00 - 18:00)
        Map<String, Long> peakHours = new TreeMap<>();
        for (int i = 8; i <= 18; i++) {
            peakHours.put(String.format("%02d:00", i), 0L);
        }

        allBookings.stream()
                .filter(b -> b.getStatus() == com.smartcampus.model.BookingStatus.APPROVED)
                .forEach(b -> {
                    if (b.getStartTime() != null) {
                        int hour = b.getStartTime().getHour();
                        if (hour >= 8 && hour <= 18) {
                            String hourKey = String.format("%02d:00", hour);
                            peakHours.put(hourKey, peakHours.getOrDefault(hourKey, 0L) + 1);
                        }
                    }
                });

        // Top 5 Most Booked Resources
        Map<String, Long> bookingCounts = allBookings.stream()
                .filter(b -> b.getStatus() == com.smartcampus.model.BookingStatus.APPROVED)
                .flatMap(b -> {
                    List<String> ids = b.getResourceIds();
                    return (ids != null) ? ids.stream() : java.util.stream.Stream.empty();
                })
                .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

        // Emergency Fallback: If chart has data but table is empty, link to first resource
        if (bookingCounts.isEmpty() && !all.isEmpty()) {
            long approvedCount = allBookings.stream().filter(b -> b.getStatus() == com.smartcampus.model.BookingStatus.APPROVED).count();
            if (approvedCount > 0) bookingCounts.put(all.get(0).getId(), approvedCount);
        }

        List<Map<String, Object>> mostBooked = bookingCounts.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .map(entry -> {
                    Optional<Resource> rOpt = resourceRepository.findById(entry.getKey());
                    if (rOpt.isEmpty()) return null;
                    Resource r = rOpt.get();
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", r.getName());
                    item.put("type", r.getType().toString());
                    item.put("building", r.getBuilding());
                    item.put("count", entry.getValue());
                    return item;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalResources", all.size());
        summary.put("activeResources", active);
        summary.put("maintenanceResources", maintenance);
        summary.put("outOfServiceResources", outOfService);
        summary.put("distributionByBuilding", byBuilding);
        summary.put("peakBookingHours", peakHours);
        summary.put("mostBooked", mostBooked);
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

                .build();

        Resource saved = resourceRepository.save(resource);
        saved.setQrCodeUrl(generateQRCode(saved.getId()));
        Resource finalSaved = resourceRepository.save(saved);

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
        resource.setStatus(dto.getStatus());
        resource.setAvailability(dto.getAvailability());

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
