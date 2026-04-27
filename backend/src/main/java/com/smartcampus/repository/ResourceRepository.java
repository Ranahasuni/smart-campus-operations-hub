package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository
        extends MongoRepository<Resource, String> {

    java.util.Optional<Resource> findByName(String name);

    // ── Single Filters ─────────────────────────────────
    List<Resource> findByBuilding(String building);
    List<Resource> findByFloor(Integer floor);
    List<Resource> findByType(ResourceType type);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByNameContainingIgnoreCase(String name);
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    // ── Combined Filters ───────────────────────────────
    List<Resource> findByBuildingAndFloor(
            String building, Integer floor);

    List<Resource> findByBuildingAndType(
            String building, ResourceType type);

    List<Resource> findByBuildingAndFloorAndType(
            String building, Integer floor, ResourceType type);

    List<Resource> findByBuildingAndFloorAndTypeAndStatus(
            String building, Integer floor,
            ResourceType type, ResourceStatus status);

    List<Resource> findByTypeAndStatus(
            ResourceType type, ResourceStatus status);

    // ── Map Filter ─────────────────────────────────────
    List<Resource> findByBuildingAndFloorOrderByRoomNumber(
            String building, Integer floor);

    long countByStatus(ResourceStatus status);

    List<Resource> findByAssignedStaffIdsContaining(String staffId);
    // ── Paginated Queries for Large Result Sets ────────────────
    @Query("{ 'building': ?0 }")
    Page<Resource> findByBuildingPaginated(String building, PageRequest pageRequest);
    
    @Query("{ 'type': ?0 }")
    Page<Resource> findByTypePaginated(ResourceType type, PageRequest pageRequest);
    
    @Query("{ 'status': ?0 }")
    Page<Resource> findByStatusPaginated(ResourceStatus status, PageRequest pageRequest);

    // ⚡ PERFORMANCE FIX: Fetch minimal data for enrichment to avoid loading large images/availability lists
    @Query(value = "{ '_id': { $in: ?0 } }", fields = "{ 'id': 1, 'name': 1, 'type': 1 }")
    List<Resource> findMinimalByIds(java.util.Collection<String> ids);

    // ⚡ ELITE CHECK: Find if a room already exists in this exact physical spot
    java.util.Optional<Resource> findByBuildingAndFloorAndRoomNumber(String building, Integer floor, String roomNumber);
}
