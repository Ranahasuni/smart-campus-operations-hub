package com.smartcampus.controller;

import com.smartcampus.dto.ResourceRequestDTO;
import com.smartcampus.dto.ResourceResponseDTO;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

        private final ResourceService resourceService;

        // GET /api/resources
        // GET /api/resources?building=X&floor=1&type=LAB
        // GET /api/resources?name=lab&status=ACTIVE
        @GetMapping
        public ResponseEntity<List<ResourceResponseDTO>> getResources(
                        @RequestParam(required = false) String building,
                        @RequestParam(required = false) Integer floor,
                        @RequestParam(required = false) ResourceType type,
                        @RequestParam(required = false) ResourceStatus status,
                        @RequestParam(required = false) Integer capacity,
                        @RequestParam(required = false) String name) {

                return ResponseEntity.ok(
                                resourceService.getResources(
                                                building, floor, type,
                                                status, capacity, name));
        }

        // GET /api/resources/{id}
        @GetMapping("/{id}")
        public ResponseEntity<ResourceResponseDTO> getResourceById(
                        @PathVariable String id) {
                return ResponseEntity.ok(
                                resourceService.getResourceById(id));
        }

        // GET /api/resources/buildings
        @GetMapping("/buildings")
        public ResponseEntity<List<String>> getBuildings() {
                return ResponseEntity.ok(
                                resourceService.getBuildings());
        }

        // GET /api/resources/floors?building=X
        @GetMapping("/floors")
        public ResponseEntity<List<Integer>> getFloors(
                        @RequestParam String building) {
                return ResponseEntity.ok(
                                resourceService.getFloorsByBuilding(building));
        }


        // GET /api/resources/map?building=X&floor=1
        @GetMapping("/map")
        public ResponseEntity<List<ResourceResponseDTO>> getFloorMap(
                        @RequestParam String building,
                        @RequestParam Integer floor) {
                return ResponseEntity.ok(
                                resourceService.getFloorMap(building, floor));
        }

        // GET /api/resources/analytics/summary
        @GetMapping("/analytics/summary")
        @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
        public ResponseEntity<Map<String, Object>> getAnalytics() {
                return ResponseEntity.ok(
                                resourceService.getAnalyticsSummary());
        }

        // POST /api/resources
        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ResourceResponseDTO> createResource(
                        @Valid @RequestBody ResourceRequestDTO dto) {
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(resourceService.createResource(dto));
        }

        // PUT /api/resources/{id}
        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ResourceResponseDTO> updateResource(
                        @PathVariable String id,
                        @Valid @RequestBody ResourceRequestDTO dto) {
                return ResponseEntity.ok(
                                resourceService.updateResource(id, dto));
        }

        // PATCH /api/resources/{id}/status
        @PatchMapping("/{id}/status")
        @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
        public ResponseEntity<ResourceResponseDTO> updateStatus(
                        @PathVariable String id,
                        @RequestParam ResourceStatus status) {
                return ResponseEntity.ok(
                                resourceService.updateStatus(id, status));
        }

        // DELETE /api/resources/{id}
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Void> deleteResource(
                        @PathVariable String id) {
                resourceService.deleteResource(id);
                return ResponseEntity.noContent().build();
        }
}
