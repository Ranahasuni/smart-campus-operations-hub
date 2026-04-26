package com.smartcampus.repository;

import com.smartcampus.model.Priority;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByUserId(String userId, Sort sort);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByPriority(Priority priority);
    List<Ticket> findByResourceId(String resourceId);
    
    // Paginated queries for better performance
    Page<Ticket> findByUserId(String userId, Pageable pageable);
    Page<Ticket> findAll(Pageable pageable);
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
    
    long countByResourceIdAndStatusInAndPriority(String resourceId, List<TicketStatus> statuses, Priority priority);
    long countByResourceIdAndStatusIn(String resourceId, List<TicketStatus> statuses);
    
    long countByStatusIn(List<TicketStatus> statuses);
    long countByTechnicianIdAndStatusIn(String techId, List<TicketStatus> statuses);
    long countByPriorityAndStatusIn(Priority priority, List<TicketStatus> statuses);
    
    // Indexed queries
    @Query("{ 'technicianId': ?0, 'status': { $in: ?1 } }")
    List<Ticket> findByTechnicianIdAndStatusIn(String techId, List<TicketStatus> statuses);
}
