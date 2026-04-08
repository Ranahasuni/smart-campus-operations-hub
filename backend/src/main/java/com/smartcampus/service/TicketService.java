package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.Comment;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.repository.TicketImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketImageRepository ticketImageRepository;
    private final AuditService auditService;

    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        
        Ticket savedTicket = ticketRepository.save(ticket);
        auditService.log(ticket.getUserId(), "TICKET_CREATED", "New ticket created with ID: " + savedTicket.getId());
        return savedTicket;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    public List<Ticket> getTicketsByUserId(String userId) {
        return ticketRepository.findByUserId(userId);
    }

    public List<Ticket> getTicketsByResourceId(String resourceId) {
        return ticketRepository.findAll().stream()
                .filter(t -> t.getResourceId() != null && t.getResourceId().equals(resourceId))
                .toList();
    }

    public Ticket updateTicketStatus(String ticketId, TicketStatus newStatus, String updatedBy, String resolutionNote) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            if (resolutionNote != null && !resolutionNote.isEmpty()) {
                ticket.setResolutionNotes(resolutionNote);
            }
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        auditService.log(updatedBy, "TICKET_STATUS_UPDATED", "Ticket " + ticketId + " status changed to " + newStatus);
        return updatedTicket;
    }

    public Ticket assignTechnician(String ticketId, String technicianId, String assignedBy) {
        Ticket ticket = getTicketById(ticketId);
        ticket.setTechnicianId(technicianId);
        ticket.setAssignedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket updatedTicket = ticketRepository.save(ticket);
        auditService.log(assignedBy, "TICKET_ASSIGNED", "Ticket " + ticketId + " assigned to technician " + technicianId);
        return updatedTicket;
    }

    public void deleteTicket(String id) {
        ticketRepository.deleteById(id);
    }

    // --- Comments Logic ---
    public Comment addComment(String ticketId, Comment comment) {
        comment.setTicketId(ticketId);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        Comment savedComment = commentRepository.save(comment);
        
        auditService.log(comment.getUserId(), "TICKET_COMMENT_ADDED", "New comment added to ticket " + ticketId);
        return savedComment;
    }

    public List<Comment> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }
}
