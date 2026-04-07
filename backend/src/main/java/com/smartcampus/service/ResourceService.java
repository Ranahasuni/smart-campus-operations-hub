package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.NotificationService;
import com.smartcampus.model.NotificationType;
import com.smartcampus.model.NotificationPriority;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    // ── HELPER — Build location string ─────────────────
    private String sanitize(String html) {
        if (html == null) return null;
        return html.replaceAll("<[^>]*>", ""); // Basic XSS protection
    }

    private String buildLocation(String building,
            Integer floor, String roomNumber) {
        return building + ", Floor " + floor
                + ", Room " + roomNumber;
    }

    // ── HELPER — Generate QR Code URL ──────────────────
    private String generateQRCode(String resourceId) {
        String resourceUrl =
                "https://smartcampus.com/resources/"
                + resourceId;
        return "https://api.qrserver.com/v1/create-qr-code/"
                + "?size=200x200&data=" + resourceUrl;
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
                .availableFrom(resource.getAvailableFrom())
                .availableTo(resource.getAvailableTo())
                .availableDays(resource.getAvailableDays())
                .qrCodeUrl(resource.getQrCodeUrl())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }

    // ── GET ALL WITH FILTERS (PAF Dynamic Search) ───────
    public List<ResourceResponseDTO> getResources(
            String building, Integer floor,
            ResourceType type, ResourceStatus status,
            Integer capacity, String name) {

        List<Resource> all = resourceRepository.findAll();

        return all.stream()
                .filter(r -> name == null || r.getName().toLowerCase().contains(name.toLowerCase()))
                .filter(r -> building == null || r.getBuilding().equalsIgnoreCase(building))
                .filter(r -> floor == null || r.getFloor().equals(floor))
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> capacity == null || r.getCapacity() >= capacity)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── GET SINGLE RESOURCE ─────────────────────────────
    public ResourceResponseDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(id));
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
                .orElseThrow(() ->
                        new ResourceNotFoundException(id));
        return resource.getQrCodeUrl();
    }

    // ── GET FLOOR MAP ───────────────────────────────────
    public List<ResourceResponseDTO> getFloorMap(String building, Integer floor) {
        return resourceRepository.findByBuildingAndFloorOrderByRoomNumber(building, floor)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── ANALYTICS SUMMARY ───────────────────────────────
    public Map<String, Object> getAnalyticsSummary() {
        List<Resource> all = resourceRepository.findAll();

        long active = all.stream().filter(r -> r.getStatus() == ResourceStatus.ACTIVE).count();
        long maintenance = all.stream().filter(r -> r.getStatus() == ResourceStatus.MAINTENANCE).count();
        long outOfService = all.stream().filter(r -> r.getStatus() == ResourceStatus.OUT_OF_SERVICE).count();

        return Map.of(
                "totalResources", all.size(),
                "activeResources", active,
                "maintenanceResources", maintenance,
                "outOfServiceResources", outOfService
        );
    }

    // ── CREATE ──────────────────────────────────────────
    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
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
                .availableFrom(dto.getAvailableFrom())
                .availableTo(dto.getAvailableTo())
                .availableDays(dto.getAvailableDays())
                .build();

        Resource saved = resourceRepository.save(resource);
        saved.setQrCodeUrl(generateQRCode(saved.getId()));
        Resource finalSaved = resourceRepository.save(saved);

        try {
            notificationService.notifyAdmins(
                "Facility Added: " + finalSaved.getName(),
                "Location: " + finalSaved.getLocation(),
                NotificationType.SYSTEM,
                NotificationPriority.MEDIUM
            );
        } catch (Exception e) {}

        return toDTO(finalSaved);
    }

    // ── UPDATE ──────────────────────────────────────────
    public ResourceResponseDTO updateResource(String id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setBuilding(dto.getBuilding());
        resource.setFloor(dto.getFloor());
        resource.setRoomNumber(dto.getRoomNumber());
        resource.setLocation(buildLocation(dto.getBuilding(), dto.getFloor(), dto.getRoomNumber()));
        resource.setEquipment(dto.getEquipment());
        resource.setImageUrls(dto.getImageUrls());
        resource.setAvailableFrom(dto.getAvailableFrom());
        resource.setAvailableTo(dto.getAvailableTo());
        resource.setAvailableDays(dto.getAvailableDays());
        resource.setUpdatedAt(LocalDateTime.now());
        
        Resource updated = resourceRepository.save(resource);

        try {
            notificationService.notifyAdmins(
                "Facility Updated: " + updated.getName(),
                "Details for " + updated.getName() + " modified.",
                NotificationType.SYSTEM,
                NotificationPriority.MEDIUM
            );
        } catch (Exception e) {}

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
                NotificationPriority.HIGH
            );
        } catch (Exception e) {}

        return toDTO(updated);
    }

    // ── DELETE ──────────────────────────────────────────
    public void deleteResource(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
        resourceRepository.delete(resource);
    }

    @PostConstruct
    public void syncFacilitiesOnStartup() {
        try {
            List<Resource> all = resourceRepository.findAll();
            if (all.isEmpty()) return;
            notificationService.notifyAdmins(
                "Sync Complete",
                all.size() + " resources indexed.",
                NotificationType.SYSTEM,
                NotificationPriority.LOW
            );
        } catch (Exception e) {}
    }
}
