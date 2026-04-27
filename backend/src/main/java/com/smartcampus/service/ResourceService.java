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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private static final Logger log = LoggerFactory.getLogger(ResourceService.class);
    private static final ExecutorService executorService = Executors.newFixedThreadPool(8);

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    public ResourceService(ResourceRepository resourceRepository, 
                           BookingRepository bookingRepository, 
                           NotificationService notificationService, 
                           MongoTemplate mongoTemplate) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.mongoTemplate = mongoTemplate;
    }

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

                .assignedStaffIds(resource.getAssignedStaffIds())
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
            Integer capacity, String name,
            List<String> features,
            int page, int size) {

        Query query = new Query();
        // ⚡ PERFORMANCE FIX: Only fetch necessary fields for the table (EXCLUDING IMAGES TO PREVENT OOM/TIMEOUTS)
        query.fields().include("id", "name", "type", "building", "floor", "roomNumber", "capacity", "status", "assignedStaffIds", "description", "equipment", "location", "availability");
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
        if (features != null && !features.isEmpty()) {
            // 🛡️ FILTER: Find resources that have ALL the selected features in their 'equipment' list
            query.addCriteria(Criteria.where("equipment").all(features));
        }

        // Apply Pagination
        query.with(org.springframework.data.domain.PageRequest.of(page, size));

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

    // ── GET SINGLE RESOURCE SUMMARY (NO IMAGES) ─────────────────
    public ResourceResponseDTO getResourceSummaryById(String id) {
        Query query = new Query(Criteria.where("id").is(id));
        query.fields().include("id", "name", "type", "building", "floor", "roomNumber", "capacity", "status", "description", "equipment", "location", "availability");
        Resource resource = mongoTemplate.findOne(query, Resource.class);
        if (resource == null) throw new ResourceNotFoundException(id);
        return toSummaryDTO(resource);
    }

    // ── GET SINGLE RESOURCE IMAGE ─────────────────────────────
    public String getResourceImage(String id) {
        Query query = new Query(Criteria.where("id").is(id));
        query.fields().include("imageUrls");
        Resource resource = mongoTemplate.findOne(query, Resource.class);
        if (resource != null && resource.getImageUrls() != null && !resource.getImageUrls().isEmpty()) {
            return resource.getImageUrls().get(0);
        }
        return null;
    }

    // ── GET BUILDINGS ───────────────────────────────────
    // ── GET BUILDINGS ───────────────────────────────────
    @Cacheable(value = "resourceMetadata", key = "'buildings'")
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
    @Cacheable(value = "resourceMetadata", key = "#building")
    public List<Integer> getFloorsByBuilding(String building) {
        return resourceRepository.findByBuilding(building)
                .stream()
                .map(Resource::getFloor)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // ── GET RESOURCES ASSIGNED TO STAFF ────────────────
    public List<ResourceResponseDTO> getAssignedResources(String staffId) {
        if (staffId == null || staffId.isBlank()) return new java.util.ArrayList<>();
        return resourceRepository.findByAssignedStaffIdsContaining(staffId)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }


    // ── GET FLOOR MAP ───────────────────────────────────
    public List<ResourceResponseDTO> getFloorMap(String building, Integer floor) {
        return resourceRepository.findByBuildingAndFloorOrderByRoomNumber(building, floor)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    // ── ANALYTICS SUMMARY (CORE ENGINE) ─────────────────
    @Cacheable(value = "analytics", unless = "#result == null")
    public Map<String, Object> getAnalyticsSummary() {
        try {
            log.info("Starting sequential analytics synchronization...");
            long start = System.currentTimeMillis();

            Map<String, Object> summary = new LinkedHashMap<>();
            
            // 1. Status Counts
            Map<String, Object> statusCounts = getStatusCounts();
            summary.putAll(statusCounts);
            log.info("Analytics: Status counts fetched ({})", statusCounts.get("totalResources"));

            // 2. Building Distribution
            Map<String, Long> buildingDist = getDistributionByBuilding();
            summary.put("distributionByBuilding", buildingDist);
            log.info("Analytics: Building distribution fetched ({} buildings)", buildingDist.size());

            // 3. Peak Hours
            Map<String, Long> peakHours = getPeakBookingHours();
            summary.put("peakBookingHours", peakHours);
            log.info("Analytics: Peak hours fetched ({} data points)", peakHours.size());

            // 4. Most Booked
            List<Map<String, Object>> mostBooked = getMostBookedResources();
            summary.put("mostBooked", mostBooked);
            log.info("Analytics: Most booked leaderboard fetched ({} items)", mostBooked.size());

            // 5. Total Sync
            long repoCount = resourceRepository.count();
            if ((long)statusCounts.getOrDefault("totalResources", 0L) < repoCount) {
                summary.put("totalResources", repoCount);
            }

            log.info("Analytics synchronization complete in {}ms", System.currentTimeMillis() - start);
            return summary;
        } catch (Exception e) {
            log.error("CRITICAL: Analytics engine failed", e);
            throw new RuntimeException("The analytics engine encountered a database synchronization error: " + e.getMessage());
        }
    }

    // Helper method 1: Get status counts
    private Map<String, Object> getStatusCounts() {
        long totalResources = resourceRepository.count();
        long active = resourceRepository.countByStatus(com.smartcampus.model.ResourceStatus.ACTIVE);
        long maintenance = resourceRepository.countByStatus(com.smartcampus.model.ResourceStatus.MAINTENANCE);
        long outOfService = resourceRepository.countByStatus(com.smartcampus.model.ResourceStatus.OUT_OF_SERVICE);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalResources", totalResources);
        result.put("activeResources", active);
        result.put("maintenanceResources", maintenance);
        result.put("outOfServiceResources", outOfService);
        return result;
    }

    // Helper method 2: Get distribution by building
    private Map<String, Long> getDistributionByBuilding() {
        org.springframework.data.mongodb.core.aggregation.Aggregation buildingAgg = org.springframework.data.mongodb.core.aggregation.Aggregation.newAggregation(
            org.springframework.data.mongodb.core.aggregation.Aggregation.match(Criteria.where("building").ne(null).ne("")),
            org.springframework.data.mongodb.core.aggregation.Aggregation.group("building").count().as("count"),
            org.springframework.data.mongodb.core.aggregation.Aggregation.project("count").and("_id").as("building")
        );
        
        List<org.bson.Document> buildingResults = mongoTemplate.aggregate(buildingAgg, "resources", org.bson.Document.class).getMappedResults();
        return buildingResults.stream()
            .filter(d -> d.getString("building") != null)
            .collect(Collectors.toMap(
                d -> d.getString("building"),
                d -> {
                    Object count = d.get("count");
                    return count instanceof Number ? ((Number) count).longValue() : 0L;
                },
                (existing, replacement) -> existing
            ));
    }

    // Helper method 3: Get peak booking hours
    private Map<String, Long> getPeakBookingHours() {
        LocalDate peakCutoff = LocalDate.now().minusDays(30);
        org.springframework.data.mongodb.core.aggregation.Aggregation peakAgg = org.springframework.data.mongodb.core.aggregation.Aggregation.newAggregation(
            org.springframework.data.mongodb.core.aggregation.Aggregation.match(Criteria.where("date").gte(peakCutoff).and("status").ne(com.smartcampus.model.BookingStatus.CANCELLED)),
            org.springframework.data.mongodb.core.aggregation.Aggregation.project()
                .andExpression("arrayElemAt(split(startTime, ':'), 0)").as("hour"),
            org.springframework.data.mongodb.core.aggregation.Aggregation.group("hour").count().as("count"),
            org.springframework.data.mongodb.core.aggregation.Aggregation.sort(org.springframework.data.domain.Sort.Direction.ASC, "_id")
        );
        
        List<org.bson.Document> peakResults = mongoTemplate.aggregate(peakAgg, "bookings", org.bson.Document.class).getMappedResults();
        Map<String, Long> peakHours = new java.util.TreeMap<>();
        for (org.bson.Document doc : peakResults) {
            String hour = doc.getString("_id");
            if (hour != null) {
                // Normalize hour to HH format (e.g., "8" -> "08")
                String normalizedHour = hour.length() == 1 ? "0" + hour : hour;
                peakHours.put(normalizedHour + ":00", ((Number) doc.get("count")).longValue());
            }
        }
        return peakHours;
    }

    // Helper method 4: Get most booked resources
    private List<Map<String, Object>> getMostBookedResources() {
        LocalDate leaderCutoff = LocalDate.now().minusDays(30); // Increased to 30 days for better data volume
        org.springframework.data.mongodb.core.aggregation.Aggregation leaderboardAgg = org.springframework.data.mongodb.core.aggregation.Aggregation.newAggregation(
            org.springframework.data.mongodb.core.aggregation.Aggregation.match(Criteria.where("date").gte(leaderCutoff).and("status").ne(com.smartcampus.model.BookingStatus.CANCELLED)),
            org.springframework.data.mongodb.core.aggregation.Aggregation.unwind("resourceIds"),
            org.springframework.data.mongodb.core.aggregation.Aggregation.group("resourceIds").count().as("count"),
            org.springframework.data.mongodb.core.aggregation.Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "count"),
            org.springframework.data.mongodb.core.aggregation.Aggregation.limit(5) // Reduced from 10 to 5 for faster queries
        );

        List<org.bson.Document> leaderboardResults = mongoTemplate.aggregate(leaderboardAgg, "bookings", org.bson.Document.class).getMappedResults();
        Set<String> topIds = leaderboardResults.stream().map(d -> d.getString("_id")).collect(Collectors.toSet());
        Map<String, Resource> topResources = resourceRepository.findAllById(topIds).stream()
            .collect(Collectors.toMap(Resource::getId, r -> r));

        return leaderboardResults.stream()
            .map(d -> {
                String rid = d.getString("_id");
                Resource r = topResources.get(rid);
                if (r == null) return null;
                
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("resourceId", rid);
                item.put("name", r.getName());
                item.put("type", r.getType() != null ? r.getType().name() : "N/A");
                item.put("building", r.getBuilding() != null ? r.getBuilding() : "N/A");
                item.put("count", ((Number) d.get("count")).longValue());
                return item;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    // Fallback analytics for timeout scenarios
    private Map<String, Object> getFallbackAnalytics() {
        Map<String, Object> fallback = new LinkedHashMap<>();
        fallback.put("totalResources", 0L);
        fallback.put("activeResources", 0L);
        fallback.put("maintenanceResources", 0L);
        fallback.put("outOfServiceResources", 0L);
        fallback.put("distributionByBuilding", new HashMap<>());
        fallback.put("peakBookingHours", new HashMap<>());
        fallback.put("mostBooked", new ArrayList<>());
        return fallback;
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

        // ⚡ ELITE CHECK: Duplicate Room Check
        // Prevent registering two different resources in the same physical location
        Optional<Resource> existingAtLocation = resourceRepository.findByBuildingAndFloorAndRoomNumber(
            dto.getBuilding(), dto.getFloor(), dto.getRoomNumber()
        );
        if (existingAtLocation.isPresent()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT, 
                "Location Conflict: " + dto.getBuilding() + " Floor " + dto.getFloor() + " Room " + dto.getRoomNumber() + " is already occupied by " + existingAtLocation.get().getName()
            );
        }

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
                .assignedStaffIds(dto.getAssignedStaffIds())
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

        // ⚡ ELITE CHECK: Duplicate Room Check
        Optional<Resource> existingAtLocation = resourceRepository.findByBuildingAndFloorAndRoomNumber(
            dto.getBuilding(), dto.getFloor(), dto.getRoomNumber()
        );
        if (existingAtLocation.isPresent() && !existingAtLocation.get().getId().equals(id)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT, 
                "Location Conflict: This physical room is already assigned to " + existingAtLocation.get().getName()
            );
        }

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
        resource.setAssignedStaffIds(dto.getAssignedStaffIds());

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
        
        // ⚡ ELITE CHECK: Booking Protection
        // Prevent deletion if there are any APPROVED or PENDING bookings for this resource
        boolean hasActiveBookings = bookingRepository.existsByResourceIdsInAndStatusIn(
            Collections.singletonList(id),
            Arrays.asList(com.smartcampus.model.BookingStatus.APPROVED, com.smartcampus.model.BookingStatus.PENDING)
        );

        if (hasActiveBookings) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.PRECONDITION_FAILED, 
                "Cannot delete: This facility has active/pending bookings. Please cancel bookings first."
            );
        }

        // ⚡ CASCADE DELETE: Remove all historic bookings associated with this resource
        // This ensures the resource disappears from analytics/leaderboards immediately.
        try {
            long deletedBookings = bookingRepository.deleteByResourceIdsContaining(id);
            log.info("Cascaded delete: Removed {} historic bookings for resource {}", deletedBookings, id);
        } catch (Exception e) {
            log.error("Failed to cascade delete bookings for resource {}: {}", id, e.getMessage());
        }

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
