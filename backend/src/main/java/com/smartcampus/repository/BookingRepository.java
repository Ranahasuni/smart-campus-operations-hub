package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    org.springframework.data.domain.Page<Booking> findByUserId(String userId, org.springframework.data.domain.Pageable pageable);
    List<Booking> findByUserId(String userId);
    java.util.Optional<Booking> findByBookingCode(String bookingCode);
    
    @org.springframework.data.mongodb.repository.Query("{ 'resourceIds': ?0 }")
    List<Booking> findByResourceIdIn(java.util.Collection<String> resourceIds);

    List<Booking> findByStatus(BookingStatus status);
    
    @org.springframework.data.mongodb.repository.Query("{ 'resourceIds': { $in: ?0 }, 'date': ?1, 'status': { $in: ?2 } }")
    List<Booking> findByResourceIdsInAndDateAndStatusIn(
        java.util.Collection<String> resourceIds, 
        LocalDate date, 
        List<BookingStatus> statuses
    );

    List<Booking> findByUserIdAndDateAndStatusIn(String userId, LocalDate date, List<BookingStatus> statuses);

    // ⚡ HIGH-SPEED QUOTA ENGINE: Count active future bookings without fetching full history
    long countByUserIdAndStatusInAndDateGreaterThanEqual(String userId, List<BookingStatus> statuses, LocalDate date);

    // ⚡ ELITE CHECK: Verify if any active bookings exist for a resource before deletion
    boolean existsByResourceIdsInAndStatusIn(java.util.Collection<String> resourceIds, java.util.Collection<BookingStatus> statuses);

    // ⚡ ANALYTICS ENGINE: Fetch only recent bookings for intelligence processing (Optimized with projection)
    @org.springframework.data.mongodb.repository.Query(value = "{ 'date': { $gte: ?0 } }", fields = "{ 'resourceIds': 1, 'startTime': 1, 'status': 1 }")
    List<Booking> findRecentForAnalytics(LocalDate date);

    long deleteByResourceIdsContaining(String resourceId);
}
