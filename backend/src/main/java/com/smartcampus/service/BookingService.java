package com.smartcampus.service;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.Locale;
import java.util.Optional;
import com.smartcampus.model.DayAvailability;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final com.smartcampus.repository.UserRepository userRepository;

    // ── Member Operations (DTO Based) ────────────────────────────────────────

    public List<BookingResponseDTO> getBookingsByResourceAndDate(String resourceId, LocalDate date) {
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
        return bookingRepository.findByResourceIdsInAndDateAndStatusIn(List.of(resourceId), date, activeStatuses)
                .stream()
                .map(this::mapToResponseDTOEnriched)
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto, String userId) {
        // 1. Quota Check for Students
        com.smartcampus.model.User requester = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        if (requester.getRole() == com.smartcampus.model.Role.STUDENT) {
            long activeBookings = bookingRepository.findByUserId(userId).stream()
                    .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED)
                    .count();
            
            if (activeBookings >= 3) {
                log.warn("Booking Quota Exceeded for user {}. Active count: {}", userId, activeBookings);
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, 
                    "Booking Quota Exceeded: Students are limited to 3 active reservations at a time to ensure fair access for all members.");
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
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity exceeded for " + resource.getName());
            }

            validateAvailability(resource, dto.getDate(), dto.getStartTime(), dto.getEndTime());
        }

        // 3. Conflict Detection
        checkForConflicts(dto.getResourceIds(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), null);

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
        
        return mapToResponseDTO(bookingRepository.save(saved));
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
        checkForConflicts(dto.getResourceIds(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), id);


        booking.setDate(dto.getDate());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setExpectedAttendees(dto.getExpectedAttendees());
        booking.setResourceIds(dto.getResourceIds());

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    private void checkForConflicts(List<String> resourceIds, LocalDate date, java.time.LocalTime start, java.time.LocalTime end, String excludeId) {
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> activeBookings = bookingRepository.findByResourceIdsInAndDateAndStatusIn(resourceIds, date, activeStatuses);

        boolean hasConflict = activeBookings.stream()
                .filter(b -> excludeId == null || !b.getId().equals(excludeId))
                .anyMatch(existing -> existing.getStartTime().isBefore(end) && existing.getEndTime().isAfter(start));

        if (hasConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "One or more selected rooms are occupied during this time.");
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

    public List<BookingResponseDTO> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponseDTOEnriched)
                .collect(Collectors.toList());
    }

    public void cancelBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found"));
        if (!booking.getUserId().equals(userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        
        log.info("Cancelling booking {} by user {}", bookingId, userId);
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public void deleteBooking(String bookingId, String userId) {
        cancelBooking(bookingId, userId);
    }

    // ── Admin Operations (Core Models) ────────────────────────────────────────

    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponseDTOEnriched)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getStaffTodaySchedule(String staffUserId) {
        // 1. Get resources assigned to this staff
        List<Resource> assignedResources = resourceRepository.findAll().stream()
                .filter(r -> r.getAssignedStaffId() != null && r.getAssignedStaffId().equals(staffUserId))
                .toList();

        if (assignedResources.isEmpty()) return List.of();

        List<String> resourceIds = assignedResources.stream().map(Resource::getId).toList();
        LocalDate today = LocalDate.now();

        // 2. Fetch all bookings for these resources today (Approved or Checked In)
        List<BookingStatus> watchStatuses = List.of(BookingStatus.APPROVED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT);
        return bookingRepository.findByResourceIdsInAndDateAndStatusIn(resourceIds, today, watchStatuses)
                .stream()
                .map(this::mapToResponseDTOEnriched)
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

    public List<Booking> findConflicts(Booking request) {
        return bookingRepository.findByResourceIdIn(request.getResourceIds()).stream()
                .filter(b -> !b.getId().equals(request.getId()))
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .filter(b -> b.getDate().equals(request.getDate()))
                .filter(b -> request.getStartTime().isBefore(b.getEndTime()) && request.getEndTime().isAfter(b.getStartTime()))
                .collect(Collectors.toList());
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return mapToResponseDTOEnriched(booking);
    }

    private BookingResponseDTO mapToResponseDTOEnriched(Booking booking) {
        List<String> resIds = booking.getResourceIds();
        List<Resource> resources = (resIds != null && !resIds.isEmpty())
                ? resourceRepository.findAllById(resIds.stream().filter(id -> id != null).collect(Collectors.toList()))
                : List.of();

        com.smartcampus.model.User user = null;
        if (booking.getUserId() != null) {
            user = userRepository.findById(booking.getUserId()).orElse(null);
        }
        
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .requesterName(user != null ? user.getFullName() : "Unknown User (" + booking.getUserId() + ")")
                .resourceIds(resIds != null ? resIds : List.of())
                .resourceNames(resources.stream().map(Resource::getName).collect(Collectors.toList()))
                .resourceType(resources.isEmpty() ? null : resources.get(0).getType())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .rejectionReason(booking.getRejectionReason())
                .bookingCode(booking.getBookingCode())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
