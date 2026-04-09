package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.Comment;
import com.smartcampus.model.Priority;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.TicketImage;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.repository.TicketImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.smartcampus.service.AuditService;
import com.smartcampus.service.ResourceService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketImageRepository ticketImageRepository;
    private final AuditService auditService;
    private final ResourceService resourceService;

    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        
        // Auto-detect priority before saving
        Priority detectedPriority = detectPriority(ticket.getTitle(), ticket.getDescription());
        if (detectedPriority == Priority.HIGH) {
            ticket.setPriority(Priority.HIGH);
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        auditService.log(ticket.getUserId(), "TICKET_CREATED", "New ticket created with ID: " + savedTicket.getId());

        // Impact Booking: If a ticket is created for a specific resource, set it to MAINTENANCE
        if (savedTicket.getResourceId() != null) {
            try {
                resourceService.updateStatus(savedTicket.getResourceId(), ResourceStatus.MAINTENANCE);
            } catch (Exception e) {
                // Log and continue if resource service fails
                System.err.println("Failed to update resource status to MAINTENANCE: " + e.getMessage());
            }
        }

        return savedTicket;
    }

    private Priority detectPriority(String title, String description) {
        String content = (title + " " + description).toLowerCase();
        
        // List of critical keywords
        String[] criticalKeywords = {
            "fire", "smoke", "burning", 
            "electric", "spark", "shock", "short circuit",
            "leak", "flood", "water burst", "pipe burst",
            "broken glass", "shattered",
            "exam", "final", "test",
            "emergency", "urgent", "danger", "hazard"
        };
        
        for (String keyword : criticalKeywords) {
            if (content.contains(keyword)) {
                return Priority.HIGH;
            }
        }
        
        return null; // No critical keywords detected, keep user's choice
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
        return ticketRepository.findByResourceId(resourceId);
    }

    public Ticket updateTicketStatus(String ticketId, TicketStatus newStatus, String updatedBy, String resolutionNote) {
        Ticket ticket = getTicketById(ticketId);
        TicketStatus oldStatus = ticket.getStatus();
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

        // Impact Booking: If a ticket is resolved or closed, check if we can set resource back to ACTIVE
        if ((newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) && ticket.getResourceId() != null) {
            // Check if there are ANY other OPEN or IN_PROGRESS tickets for this resource
            long openTicketsCount = ticketRepository.countByResourceIdAndStatusIn(
                ticket.getResourceId(), 
                List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)
            );
            
            if (openTicketsCount == 0) {
                try {
                    resourceService.updateStatus(ticket.getResourceId(), ResourceStatus.ACTIVE);
                } catch (Exception e) {
                    System.err.println("Failed to reset resource status to ACTIVE: " + e.getMessage());
                }
            }
        }

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

    // --- Images Logic ---
    public List<TicketImage> saveImages(String ticketId, List<String> fileNames, String uploadedBy) {
        Ticket ticket = getTicketById(ticketId);
        java.util.List<TicketImage> savedImages = new java.util.ArrayList<>();
        
        for (String fileName : fileNames) {
            TicketImage img = new TicketImage();
            img.setTicketId(ticketId);
            img.setImageUrl("/api/uploads/" + fileName);
            img.setUploadedBy(uploadedBy);
            img.setUploadedAt(LocalDateTime.now());
            savedImages.add(ticketImageRepository.save(img));
        }

        auditService.log(uploadedBy, "TICKET_IMAGES_UPLOADED", "Uploaded " + fileNames.size() + " images to ticket " + ticketId);
        return savedImages;
    }

    public List<TicketImage> getImagesByTicketId(String ticketId) {
        return ticketImageRepository.findByTicketId(ticketId);
    }
}
