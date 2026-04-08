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
        return bookingRepository.findByResourceIdAndDateAndStatusIn(resourceId, date, activeStatuses)
                .stream()
                .map(this::mapToResponseDTOEnriched)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO createBooking(BookingRequestDTO dto, String userId) {
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource is currently unavailable");
        }

        if (dto.getExpectedAttendees() > resource.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity exceeded");
        }

        checkForConflicts(dto.getResourceId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), null);

        Booking booking = Booking.builder()
                .userId(userId)
                .resourceId(dto.getResourceId())
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    public BookingResponseDTO updateBooking(String id, BookingRequestDTO dto, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be modified");
        }

        checkForConflicts(dto.getResourceId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), id);

        booking.setDate(dto.getDate());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setExpectedAttendees(dto.getExpectedAttendees());

        return mapToResponseDTO(bookingRepository.save(booking));
    }

    private void checkForConflicts(String resourceId, LocalDate date, java.time.LocalTime start, java.time.LocalTime end, String excludeId) {
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> activeBookings = bookingRepository.findByResourceIdAndDateAndStatusIn(resourceId, date, activeStatuses);

        boolean hasConflict = activeBookings.stream()
                .filter(b -> excludeId == null || !b.getId().equals(excludeId))
                .anyMatch(existing -> existing.getStartTime().isBefore(end) && existing.getEndTime().isAfter(start));

        if (hasConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Time slot overlap detected.");
        }
    }

    public BookingResponseDTO getBookingById(String id) {
        return bookingRepository.findById(id)
                .map(this::mapToResponseDTOEnriched)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
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

    public Booking getBookingByIdRaw(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
    }

    public Booking updateBookingStatus(String id, BookingStatus status, String reason, String adminId) {
        Booking booking = getBookingByIdRaw(id);
        
        if (status == BookingStatus.APPROVED) {
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

        auditService.log(adminId, "BOOKING_MODERATION", 
            "Admin " + status + " booking " + id + (status == BookingStatus.REJECTED ? " for Reason: " + reason : ""));

        if (status == BookingStatus.APPROVED) {
            notificationService.notifyBookingApproved(booking.getUserId(), booking.getId(), booking.getResourceId());
        } else if (status == BookingStatus.REJECTED) {
            notificationService.notifyBookingRejected(booking.getUserId(), booking.getId(), booking.getResourceId(), reason);
        }

        return saved;
    }

    public List<Booking> findConflicts(Booking request) {
        return bookingRepository.findByResourceId(request.getResourceId()).stream()
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
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
        com.smartcampus.model.User user = userRepository.findById(booking.getUserId()).orElse(null);
        
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .requesterName(user != null ? user.getFullName() : "Unknown User")
                .resourceId(booking.getResourceId())
                .resourceName(resource != null ? resource.getName() : "Unknown Resource")
                .resourceType(resource != null ? resource.getType() : null)
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
