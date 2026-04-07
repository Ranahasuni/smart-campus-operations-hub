package com.smartcampus.service;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + id));
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    /**
     * Updates booking status (Approving / Rejecting)
     * Performs a final conflict check before approval to ensure data integrity.
     */
    public Booking updateBookingStatus(String id, BookingStatus status, String reason, String adminId) {
        Booking booking = getBookingById(id);
        
        if (status == BookingStatus.APPROVED) {
            // Final Conflict Check
            List<Booking> conflicts = findConflicts(booking);
            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("CONFLICT: This slot was already taken by " + conflicts.get(0).getId());
            }
            booking.setRejectionReason(null);
        } else if (status == BookingStatus.REJECTED) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new IllegalArgumentException("REJECTION_REQUIRED: A valid reason must be provided for rejection.");
            }
            booking.setRejectionReason(reason);
        }

        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);

        // Security / Transparency: Audit logging
        auditService.log(adminId, "BOOKING_MODERATION", 
            "Admin " + status + " booking " + id + (status == BookingStatus.REJECTED ? " for Reason: " + reason : ""));

        // Alerting: Notify the requester via dedicated notification channels
        if (status == BookingStatus.APPROVED) {
            notificationService.notifyBookingApproved(booking.getUserId(), booking.getId(), booking.getResourceId());
        } else if (status == BookingStatus.REJECTED) {
            notificationService.notifyBookingRejected(booking.getUserId(), booking.getId(), booking.getResourceId(), reason);
        }

        return saved;
    }

    /**
     * Checks if a booking overlaps with ANY approved booking in the system.
     * Core business logic requested for AdminReviewPage.
     */
    public List<Booking> findConflicts(Booking request) {
        return bookingRepository.findByResourceId(request.getResourceId()).stream()
                .filter(b -> !b.getId().equals(request.getId())) // Don't check against self
                .filter(b -> b.getStatus() == BookingStatus.APPROVED) // Only approved ones count as hurdles
                .filter(b -> b.getDate().equals(request.getDate())) // Same day
                .filter(b -> {
                    // Overlap formula: (StartA < EndB) AND (EndA > StartB)
                    return request.getStartTime().isBefore(b.getEndTime()) && 
                           request.getEndTime().isAfter(b.getStartTime());
                })
                .collect(Collectors.toList());
    }

    public Booking createBooking(Booking booking) {
        // Initial sanity check
        List<Booking> conflicts = findConflicts(booking);
        if(!conflicts.isEmpty()){
            log.warn("Attempted to book a conflicting slot: {}", booking);
        }
        return bookingRepository.save(booking);
    }
}
