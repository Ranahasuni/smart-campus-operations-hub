package com.smartcampus.service;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.Locale;
import java.util.Optional;
import com.smartcampus.model.DayAvailability;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final com.smartcampus.repository.UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, 
                          ResourceRepository resourceRepository, 
                          NotificationService notificationService, 
                          AuditService auditService, 
                          com.smartcampus.repository.UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    // ── Member Operations (DTO Based) ────────────────────────────────────────

    public List<BookingResponseDTO> getBookingsByResourceAndDate(String resourceId, LocalDate date) {
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> bookings = bookingRepository.findByResourceIdsInAndDateAndStatusIn(List.of(resourceId), date, activeStatuses);
        if (bookings.isEmpty()) return List.of();

        // 1. Bulk Fetch Resources
        Set<String> resourceIds = bookings.stream()
                .filter(b -> b.getResourceIds() != null)
                .flatMap(b -> b.getResourceIds().stream())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<String, Resource> resourceMap = resourceRepository.findAllById(resourceIds).stream()
                .collect(Collectors.toMap(Resource::getId, r -> r));

        // 2. Bulk Fetch Users
        Set<String> userIds = bookings.stream()
                .map(Booking::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<String, com.smartcampus.model.User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(com.smartcampus.model.User::getId, u -> u));

        return bookings.stream()
                .map(b -> mapToResponseDTOWithData(b, userMap.get(b.getUserId()), resourceMap))
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto, String userId) {
        // 1. Quota Check for Students
        com.smartcampus.model.User requester = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (requester.getRole() == com.smartcampus.model.Role.STUDENT) {
            LocalDate today = LocalDate.now();
            List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.CHECKED_IN);
            
            // ⚡ FAST PATH: Use DB count instead of fetching all history
            long activeCount = bookingRepository.countByUserIdAndStatusInAndDateGreaterThanEqual(userId, activeStatuses, today);
            
            if (activeCount >= 3) {
                // Only if quota full, fetch details to show in error (Rare path)
                List<Booking> activeList = bookingRepository.findByUserId(userId).stream()
                    .filter(b -> activeStatuses.contains(b.getStatus()) && !b.getDate().isBefore(today))
                    .toList();

                String bookingList = activeList.stream()
                    .map(b -> (b.getBookingCode() != null ? b.getBookingCode() : "RSV-NEW") + " (" + b.getDate() + ")")
                    .collect(Collectors.joining(", "));
                
                log.warn("Quota block for {}: {}", userId, bookingList);
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                    "Quota Limit Reached (3/3). Active reservations: " + bookingList + 
                    ". Please cancel or complete them to book more.");
            }
        }

        // 2. Core Rule: Max 5 rooms
        if (dto.getResourceIds().size() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum of 5 rooms per booking request.");
        }

        // 2. Resource Existence and Status Check
        List<Resource> resources = resourceRepository.findAllById(dto.getResourceIds());
        if (resources.size() != dto.getResourceIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more resources not found.");
        }

        for (Resource resource : resources) {
            // Role-based Type Restriction
            if (requester.getRole() == com.smartcampus.model.Role.STUDENT) {
                if (resource.getType() == com.smartcampus.model.ResourceType.LECTURE_HALL || 
                    resource.getType() == com.smartcampus.model.ResourceType.LECTURE_THEATRE) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                        "Students are not permitted to book " + resource.getType().toString().replace("_", " ") + "s.");
                }
            }

            if (resource.getStatus() != ResourceStatus.ACTIVE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource " + resource.getName() + " is currently unavailable");
            }

            if (dto.getExpectedAttendees() > resource.getCapacity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    String.format("Capacity Exceeded: %s only supports a maximum of %d seats. Please reduce your attendee count.", 
                        resource.getName(), resource.getCapacity()));
            }

            validateAvailability(resource, dto.getDate(), dto.getStartTime(), dto.getEndTime());
        }

        // 3. Conflict Detection
        // 3. Conflict Detection with Role Priority
        checkForConflicts(dto.getResourceIds(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), null, requester.getRole());

        // 4. Build Simplified Booking
        Booking booking = Booking.builder()
                .userId(userId)
                .resourceIds(dto.getResourceIds())
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .isExternalUser(false)
                .isPaid(true) // Campus bookings are effectively pre-paid/free
                .totalFee(0.0)
                .build();
        
        log.info("Creating new booking request for user {} on {}. Resources: {}", userId, dto.getDate(), dto.getResourceIds());
        Booking saved = bookingRepository.save(booking);
        String code = "RSV-" + saved.getDate().getYear() + "-" + saved.getId().substring(Math.max(0, saved.getId().length() - 5)).toUpperCase();
        saved.setBookingCode(code);
        
        BookingResponseDTO response = mapToResponseDTO(bookingRepository.save(saved));
        auditService.log(userId, "BOOKING_CREATE", "Created booking for " + dto.getResourceIds().size() + " resource(s) on " + dto.getDate());
        return response;
    }

    @org.springframework.transaction.annotation.Transactional
    public BookingResponseDTO updateBooking(String id, BookingRequestDTO dto, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be modified");
        }
        
        auditService.log(userId, "BOOKING_UPDATE", "Updated booking " + id);

        List<Resource> resources = resourceRepository.findAllById(dto.getResourceIds());
        if (resources.size() != dto.getResourceIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more resources not found.");
        }
        
        for (Resource resource : resources) {
            if (dto.getExpectedAttendees() > resource.getCapacity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity exceeded for " + resource.getName());
            }
            validateAvailability(resource, dto.getDate(), dto.getStartTime(), dto.getEndTime());
        }
        com.smartcampus.model.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        checkForConflicts(dto.getResourceIds(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), id, user.getRole());


        booking.setDate(dto.getDate());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setExpectedAttendees(dto.getExpectedAttendees());
        booking.setResourceIds(dto.getResourceIds());

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    private void checkForConflicts(List<String> resourceIds, LocalDate date, java.time.LocalTime start, java.time.LocalTime end, String excludeId, com.smartcampus.model.Role requesterRole) {
        List<BookingStatus> watchStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> activeBookings = bookingRepository.findByResourceIdsInAndDateAndStatusIn(resourceIds, date, watchStatuses);

        if (activeBookings.isEmpty()) return;

        // Fetch user roles for all active bookings to check priority
        Set<String> userIds = activeBookings.stream().map(Booking::getUserId).collect(Collectors.toSet());
        Map<String, com.smartcampus.model.Role> userRoles = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(com.smartcampus.model.User::getId, com.smartcampus.model.User::getRole, (a, b) -> a));

        for (Booking existing : activeBookings) {
            if (excludeId != null && existing.getId().equals(excludeId)) continue;

            // Overlap Detection: start < existing.end && end > existing.start
            boolean overlaps = existing.getStartTime().isBefore(end) && existing.getEndTime().isAfter(start);
            if (!overlaps) continue;

            // Rule 1: APPROVED always blocks
            if (existing.getStatus() == BookingStatus.APPROVED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "The facility is already reserved for this time slot.");
            }

            // Rule 2: Lecturer PENDING blocks everyone (Equal Priority Rule)
            com.smartcampus.model.Role existingRole = userRoles.get(existing.getUserId());
            boolean existingIsPriority = existingRole == com.smartcampus.model.Role.LECTURER || existingRole == com.smartcampus.model.Role.ADMIN;
            
            if (existingIsPriority) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A faculty member has already requested this slot. Please choose another time.");
            }

            // Rule 3: Student PENDING blocks other Students
            if (requesterRole == com.smartcampus.model.Role.STUDENT) {
                 throw new ResponseStatusException(HttpStatus.CONFLICT, "Another student has a pending request for this slot.");
            }
            
            // Case 4: Requester is LECTURER and existing is STUDENT PENDING -> Allowed (Priority Request)
        }
    }

    private void validateAvailability(Resource resource, LocalDate date, LocalTime start, LocalTime end) {
        if (resource.getAvailability() == null || resource.getAvailability().isEmpty()) {
            return; // Assume always available if not specified (or should we throw error?)
        }

        String dayOfWeek = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH); // "Mon", "Tue", etc.
        
        Optional<DayAvailability> availabilityOpt = resource.getAvailability().stream()
                .filter(a -> a.getDay().equalsIgnoreCase(dayOfWeek))
                .findFirst();

        if (availabilityOpt.isEmpty() || !availabilityOpt.get().isAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource is not available on " + dayOfWeek);
        }

        DayAvailability availability = availabilityOpt.get();
        if (availability.getSlots() == null || availability.getSlots().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No time slots defined for " + dayOfWeek);
        }

        boolean fitsInAnySlot = availability.getSlots().stream().anyMatch(slot -> {
            LocalTime slotStart = LocalTime.parse(slot.getStartTime());
            LocalTime slotEnd = LocalTime.parse(slot.getEndTime());
            return !start.isBefore(slotStart) && !end.isAfter(slotEnd);
        });

        if (!fitsInAnySlot) {
            String slotsStr = availability.getSlots().stream()
                .map(s -> s.getStartTime() + "-" + s.getEndTime())
                .collect(java.util.stream.Collectors.joining(", "));
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                String.format("Requested time is outside operational hours. Available slots for %s: %s", 
                    dayOfWeek, slotsStr));
        }
    }



    public BookingResponseDTO getBookingById(String id) {
        return bookingRepository.findById(id)
                .map(this::mapToResponseDTOEnriched)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    public BookingResponseDTO getBookingByIdSecure(String id, String userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        
        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to unauthorized reservation record.");
        }
        
        return mapToResponseDTOEnriched(booking);
    }

    public List<BookingResponseDTO> getUserBookings(String userId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );
        
        List<Booking> bookings = bookingRepository.findByUserId(userId, pageable).getContent();
        if (bookings.isEmpty()) return List.of();

        // Bulk fetch all required resources
        Set<String> resourceIds = bookings.stream()
                .filter(b -> b.getResourceIds() != null)
                .flatMap(b -> b.getResourceIds().stream())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Resource> resourceMap = resourceRepository.findAllById(resourceIds).stream()
                .collect(Collectors.toMap(Resource::getId, r -> r, (a, b) -> a));

        // Fetch user once
        com.smartcampus.model.User user = userRepository.findById(userId).orElse(null);

        return bookings.stream()
                .map(b -> mapToResponseDTOWithData(b, user, resourceMap))
                .collect(Collectors.toList());
    }

    public void cancelBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        com.smartcampus.model.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context lost"));

        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized cancellation attempt.");
        }

        // Rule: Only PENDING bookings can be cancelled by non-admins. 
        boolean isAdminOrLecturer = user.getRole() == com.smartcampus.model.Role.ADMIN || user.getRole() == com.smartcampus.model.Role.LECTURER;
        
        if (booking.getStatus() == BookingStatus.APPROVED && !isAdminOrLecturer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Approved reservations can only be managed by Administrators or Faculty.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        log.info("User {} cancelled booking {}", userId, bookingId);
        auditService.log(userId, "BOOKING_CANCEL", "Cancelled booking " + bookingId);
    }

    public void deleteBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized deletion attempt.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Withdrawal Error: Only PENDING requests can be deleted by users.");
        }

        bookingRepository.delete(booking);
        log.info("User {} withdrew pending request {}", userId, bookingId);
    }

    // ── Admin Operations (Core Models) ────────────────────────────────────────

    public List<BookingResponseDTO> getAllBookings(int page, int size) {
        // 🚀 HIGH PERFORMANCE: Use proper pagination instead of loading everything
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
            page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")
        );
        
        List<Booking> bookings = bookingRepository.findAll(pageable).getContent();
        if (bookings.isEmpty()) return List.of();

        // 1. Bulk Fetch Resources
        Set<String> resourceIds = bookings.stream()
                .filter(b -> b.getResourceIds() != null)
                .flatMap(b -> b.getResourceIds().stream())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<String, Resource> resourceMap = resourceRepository.findAllById(resourceIds).stream()
                .collect(Collectors.toMap(Resource::getId, r -> r, (a, b) -> a));

        // 2. Bulk Fetch Users
        Set<String> userIds = bookings.stream()
                .map(Booking::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<String, com.smartcampus.model.User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(com.smartcampus.model.User::getId, u -> u, (a, b) -> a));

        return bookings.stream()
                .map(b -> mapToResponseDTOWithData(b, userMap.get(b.getUserId()), resourceMap))
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getStaffTodaySchedule(String staffUserId) {
        // 1. Get resources assigned to this staff (targeted query instead of full scan)
        List<Resource> assignedResources = resourceRepository.findByAssignedStaffIdsContaining(staffUserId);

        if (assignedResources.isEmpty()) return List.of();

        List<String> resourceIds = assignedResources.stream().map(Resource::getId).toList();
        LocalDate today = LocalDate.now();

        // 2. Fetch all bookings for these resources today (Approved or Checked In)
        List<BookingStatus> watchStatuses = List.of(BookingStatus.APPROVED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT);
        List<Booking> bookings = bookingRepository.findByResourceIdsInAndDateAndStatusIn(resourceIds, today, watchStatuses);
        
        if (bookings.isEmpty()) return List.of();

        // 3. Bulk Enrichment
        Set<String> allResIds = bookings.stream().filter(b -> b.getResourceIds() != null).flatMap(b -> b.getResourceIds().stream()).collect(Collectors.toSet());
        Map<String, Resource> resourceMap = resourceRepository.findAllById(allResIds).stream()
                .collect(Collectors.toMap(Resource::getId, r -> r));
        
        Set<String> userIds = bookings.stream().map(Booking::getUserId).collect(Collectors.toSet());
        Map<String, com.smartcampus.model.User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(com.smartcampus.model.User::getId, u -> u));

        return bookings.stream()
                .map(b -> mapToResponseDTOWithData(b, userMap.get(b.getUserId()), resourceMap))
                .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .collect(Collectors.toList());
    }

    public Booking getBookingByIdRaw(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
    }

    public Booking updateBookingStatus(String id, BookingStatus status, String reason, String adminId) {
        Booking booking = getBookingByIdRaw(id);
        
        if (status == BookingStatus.APPROVED) {
            // Check if resources still exist
            for (String rId : booking.getResourceIds()) {
                if (!resourceRepository.existsById(rId)) {
                    throw new IllegalStateException("RESOURCE_MISSING: Facility " + rId + " has been decommissioned.");
                }
            }

            List<Booking> conflicts = findConflicts(booking);
            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("CONFLICT: Slot already occupied.");
            }
            booking.setRejectionReason(null);
        } else if (status == BookingStatus.REJECTED) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new IllegalArgumentException("REJECTION_REQUIRED: Reason needed.");
            }
            booking.setRejectionReason(reason);
        }

        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);

        // Auto-Resolution: Reject overlapping pending requests if this one was approved
        if (status == BookingStatus.APPROVED) {
            rejectOverlappingPendingBookings(booking, adminId);
        }

        log.info("Admin {} updated booking {} status to {}", adminId, id, status);
        
        auditService.log(adminId, "BOOKING_MODERATION", 
            "Admin " + status + " booking " + id + (status == BookingStatus.REJECTED ? " for Reason: " + reason : ""));

        String notifyResourceId = booking.getResourceIds().isEmpty() ? "unknown" : booking.getResourceIds().get(0);
        if (status == BookingStatus.APPROVED) {
            notificationService.notifyBookingApproved(booking.getUserId(), booking.getId(), notifyResourceId);
        } else if (status == BookingStatus.REJECTED) {
            notificationService.notifyBookingRejected(booking.getUserId(), booking.getId(), notifyResourceId, reason);
        }

        return saved;
    }

    private void rejectOverlappingPendingBookings(Booking approvedBooking, String adminId) {
        List<Booking> pendingOverlaps = bookingRepository.findByResourceIdsInAndDateAndStatusIn(
            approvedBooking.getResourceIds(), 
            approvedBooking.getDate(), 
            List.of(BookingStatus.PENDING)
        );

        pendingOverlaps.stream()
            .filter(b -> !b.getId().equals(approvedBooking.getId()))
            .filter(b -> b.getStartTime().isBefore(approvedBooking.getEndTime()) && b.getEndTime().isAfter(approvedBooking.getStartTime()))
            .forEach(b -> {
                b.setStatus(BookingStatus.REJECTED);
                b.setRejectionReason("Another reservation for " + b.getStartTime() + " was authorized for this facility. Your request has been automatically declined.");
                bookingRepository.save(b);
                
                // Notify the displaced user
                String resId = b.getResourceIds().isEmpty() ? "unknown" : b.getResourceIds().get(0);
                notificationService.notifyBookingRejected(b.getUserId(), b.getId(), resId, b.getRejectionReason());
                
                log.info("Auto-rejected overlapping booking {} due to approval of {}", b.getId(), approvedBooking.getId());
            });
    }

    public List<Booking> findConflicts(Booking request) {
        return bookingRepository.findByResourceIdsInAndDateAndStatusIn(request.getResourceIds(), request.getDate(), List.of(BookingStatus.APPROVED)).stream()
                .filter(b -> !b.getId().equals(request.getId()))
                .filter(b -> request.getStartTime().isBefore(b.getEndTime()) && request.getEndTime().isAfter(b.getStartTime()))
                .collect(Collectors.toList());
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return mapToResponseDTOEnriched(booking);
    }

    private BookingResponseDTO mapToResponseDTOEnriched(Booking booking) {
        com.smartcampus.model.User user = (booking.getUserId() != null) 
            ? userRepository.findById(booking.getUserId()).orElse(null) 
            : null;
            
        List<Resource> resources = (booking.getResourceIds() != null && !booking.getResourceIds().isEmpty())
            ? resourceRepository.findAllById(booking.getResourceIds())
            : List.of();
            
        Map<String, Resource> resourceMap = resources.stream().collect(Collectors.toMap(Resource::getId, r -> r));
        return mapToResponseDTOWithData(booking, user, resourceMap);
    }

    private BookingResponseDTO mapToResponseDTOWithData(Booking booking, com.smartcampus.model.User user, Map<String, Resource> resourceMap) {
        List<String> resIds = booking.getResourceIds() != null ? booking.getResourceIds() : List.of();
        
        List<String> names = resIds.stream()
                .map(id -> resourceMap.containsKey(id) ? resourceMap.get(id).getName() : "Unknown Facility")
                .collect(Collectors.toList());
                
        com.smartcampus.model.ResourceType type = null;
        if (!resIds.isEmpty() && resourceMap.containsKey(resIds.get(0))) {
            type = resourceMap.get(resIds.get(0)).getType();
        }

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .requesterName(user != null ? user.getFullName() : "Unknown User")
                .resourceIds(resIds)
                .resourceNames(names)
                .resourceType(type)
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .rejectionReason(booking.getRejectionReason())
                .bookingCode(booking.getBookingCode())
                .requesterRole(user != null ? user.getRole() : null)
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
