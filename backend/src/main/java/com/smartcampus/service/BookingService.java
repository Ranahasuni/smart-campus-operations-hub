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

        // 4. Time Window Check (Optional, but recommended)
        // You can add logic here to compare dto.startTime/endTime with resource.availableFrom/To

        // 5. Conflict Check (MOST IMPORTANT)
        // (existing.start < new.end) AND (existing.end > new.start)
        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> conflicts = bookingRepository.findByResourceIdAndDateAndStatusIn(
                dto.getResourceId(), dto.getDate(), activeStatuses);

        boolean hasConflict = conflicts.stream().anyMatch(existing -> 
            existing.getStartTime().isBefore(dto.getEndTime()) && 
            existing.getEndTime().isAfter(dto.getStartTime())
        );

        if (hasConflict) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The selected time slot overlaps with an existing booking.");
        }

        // 6. Create Booking
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

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .resourceId(booking.getResourceId())
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
