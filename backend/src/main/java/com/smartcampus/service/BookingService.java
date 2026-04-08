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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public List<BookingResponseDTO> getBookingsByResourceAndDate(String resourceId, LocalDate date) {
        // Only include active bookings (PENDING or APPROVED) for availability checks
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
        
        return bookingRepository.findByResourceIdAndDateAndStatusIn(resourceId, date, activeStatuses)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO getBookingById(String id) {
        return bookingRepository.findById(id)
                .map(this::mapToResponseDTOEnriched)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    public BookingResponseDTO createBooking(BookingRequestDTO dto, String userId) {
        // 1. Fetch Resource
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        // 2. Resource Status Check
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource is currently unavailable for booking");
        }

        // 3. Capacity Check
        if (dto.getExpectedAttendees() > resource.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected attendees exceed resource capacity (" + resource.getCapacity() + ")");
        }

        // 4. Conflict Check (Refactored)
        checkForConflicts(dto.getResourceId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), null);

        // 5. Create Booking
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

        // 1. Ownership & Status Check
        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized action");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be modified");
        }

        // 2. Fetch Resource for validation
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        // 3. Capacity Check
        if (dto.getExpectedAttendees() > resource.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity exceeded");
        }

        // 4. Conflict Check (Excluding self)
        checkForConflicts(dto.getResourceId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), id);

        // 5. Update Fields
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
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The selected time slot overlaps with an existing booking.");
        }
    }

    public List<BookingResponseDTO> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponseDTOEnriched)
                .collect(Collectors.toList());
    }

    public void cancelBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized action");
        }

        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending or approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public void deleteBooking(String bookingId, String userId) {
        // PERMIT SOFT DELETE (Update status to CANCELLED instead of hard delete)
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized action");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be withdrawn");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return mapToResponseDTOEnriched(booking);
    }

    private BookingResponseDTO mapToResponseDTOEnriched(Booking booking) {
        Resource resource = resourceRepository.findById(booking.getResourceId()).orElse(null);

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
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
