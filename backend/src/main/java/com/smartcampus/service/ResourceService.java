package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;

    // ── HELPER — Build location string ─────────────────
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

    // ── GET ALL WITH FILTERS ────────────────────────────
    public List<ResourceResponseDTO> getResources(
            String building, Integer floor,
            ResourceType type, ResourceStatus status,
            Integer capacity, String name) {

        List<Resource> resources;

        if (name != null) {
            resources = resourceRepository
                    .findByNameContainingIgnoreCase(name);
        } else if (building != null && floor != null
                && type != null && status != null) {
            resources = resourceRepository
                    .findByBuildingAndFloorAndTypeAndStatus(
                            building, floor, type, status);
        } else if (building != null && floor != null
                && type != null) {
            resources = resourceRepository
                    .findByBuildingAndFloorAndType(
                            building, floor, type);
        } else if (building != null && floor != null) {
            resources = resourceRepository
                    .findByBuildingAndFloor(building, floor);
        } else if (building != null && type != null) {
            resources = resourceRepository
                    .findByBuildingAndType(building, type);
        } else if (building != null) {
            resources = resourceRepository
                    .findByBuilding(building);
        } else if (type != null) {
            resources = resourceRepository
                    .findByType(type);
        } else if (status != null) {
            resources = resourceRepository
                    .findByStatus(status);
        } else if (capacity != null) {
            resources = resourceRepository
                    .findByCapacityGreaterThanEqual(capacity);
        } else {
            resources = resourceRepository.findAll();
        }

        return resources.stream()
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
    public List<ResourceResponseDTO> getFloorMap(
            String building, Integer floor) {
        return resourceRepository
                .findByBuildingAndFloorOrderByRoomNumber(
                        building, floor)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── GET ANALYTICS SUMMARY ───────────────────────────
    public Map<String, Object> getAnalyticsSummary() {
        List<Resource> all = resourceRepository.findAll();

        long active = all.stream()
                .filter(r -> r.getStatus()
                        == ResourceStatus.ACTIVE)
                .count();
        long maintenance = all.stream()
                .filter(r -> r.getStatus()
                        == ResourceStatus.MAINTENANCE)
                .count();
        long outOfService = all.stream()
                .filter(r -> r.getStatus()
                        == ResourceStatus.OUT_OF_SERVICE)
                .count();

        Map<String, Long> byType = all.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getType().toString(),
                        Collectors.counting()));

        Map<String, Long> byBuilding = all.stream()
                .collect(Collectors.groupingBy(
                        Resource::getBuilding,
                        Collectors.counting()));

        return Map.of(
                "totalResources", all.size(),
                "activeResources", active,
                "maintenanceResources", maintenance,
                "outOfServiceResources", outOfService,
                "resourcesByType", byType,
                "resourcesByBuilding", byBuilding
        );
    }

    // ── CREATE ──────────────────────────────────────────
    public ResourceResponseDTO createResource(
            ResourceRequestDTO dto) {

        Resource resource = Resource.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .building(dto.getBuilding())
                .floor(dto.getFloor())
                .roomNumber(dto.getRoomNumber())
                .location(buildLocation(
                        dto.getBuilding(),
                        dto.getFloor(),
                        dto.getRoomNumber()))
                .status(dto.getStatus() != null
                        ? dto.getStatus()
                        : ResourceStatus.ACTIVE)
                .equipment(dto.getEquipment())
                .imageUrls(dto.getImageUrls())
                .availableFrom(dto.getAvailableFrom())
                .availableTo(dto.getAvailableTo())
                .availableDays(dto.getAvailableDays())
                .build();

        // save first to get MongoDB ID
        Resource saved = resourceRepository.save(resource);

        // generate QR using real ID
        saved.setQrCodeUrl(generateQRCode(saved.getId()));

        // save again with QR
        return toDTO(resourceRepository.save(saved));
    }

    // ── UPDATE ──────────────────────────────────────────
    public ResourceResponseDTO updateResource(
            String id, ResourceRequestDTO dto) {

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(id));

        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setBuilding(dto.getBuilding());
        resource.setFloor(dto.getFloor());
        resource.setRoomNumber(dto.getRoomNumber());
        resource.setLocation(buildLocation(
                dto.getBuilding(),
                dto.getFloor(),
                dto.getRoomNumber()));
        resource.setEquipment(dto.getEquipment());
        resource.setImageUrls(dto.getImageUrls());
        resource.setAvailableFrom(dto.getAvailableFrom());
        resource.setAvailableTo(dto.getAvailableTo());
        resource.setAvailableDays(dto.getAvailableDays());
        resource.setUpdatedAt(LocalDateTime.now());

        return toDTO(resourceRepository.save(resource));
    }

    // ── STATUS CHANGE ───────────────────────────────────
    public ResourceResponseDTO updateStatus(
            String id, ResourceStatus newStatus) {

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(id));

        ResourceStatus oldStatus = resource.getStatus();
        resource.setStatus(newStatus);
        resource.setUpdatedAt(LocalDateTime.now());
        Resource updated = resourceRepository.save(resource);

        // Innovation — Auto Maintenance Ticket
        if (newStatus == ResourceStatus.OUT_OF_SERVICE
                && oldStatus != ResourceStatus.OUT_OF_SERVICE) {

            Ticket autoTicket = Ticket.builder()
                    .resourceId(resource.getId())
                    .issueType(IssueType.OTHER)
                    .description("Resource '"
                            + resource.getName()
                            + "' at "
                            + resource.getLocation()
                            + " marked as OUT_OF_SERVICE."
                            + " Please inspect and resolve.")
                    .priority(Priority.HIGH)
                    .status(TicketStatus.OPEN)
                    .contactDetails(
                            "Admin System — Auto Generated")
                    .build();

            ticketRepository.save(autoTicket);
        }

        return toDTO(updated);
    }

    // ── DELETE ──────────────────────────────────────────
    public void deleteResource(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(id));
        resourceRepository.delete(resource);
    }
}
