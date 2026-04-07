package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    /**
     * Find bookings for a specific resource on a specific date that are not rejected or cancelled.
     */
    List<Booking> findByResourceIdAndDateAndStatusIn(
        String resourceId, 
        LocalDate date, 
        List<BookingStatus> statuses
    );

    List<Booking> findByResourceId(String resourceId);
    
    List<Booking> findByUserId(String userId);
}
