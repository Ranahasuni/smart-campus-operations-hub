package com.smartcampus.repository;

import com.smartcampus.model.TicketImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketImageRepository extends MongoRepository<TicketImage, String> {
    List<TicketImage> findByTicketId(String ticketId);
}
