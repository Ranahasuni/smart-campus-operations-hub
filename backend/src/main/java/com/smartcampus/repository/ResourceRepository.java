package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
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
}
