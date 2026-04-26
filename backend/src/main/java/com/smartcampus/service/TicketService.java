package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.Comment;
import com.smartcampus.model.Priority;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.TicketImage;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.model.DatabaseSequence;
import com.smartcampus.repository.DatabaseSequenceRepository;
import com.smartcampus.repository.TicketImageRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.model.User;
import org.springframework.stereotype.Service;
import com.smartcampus.service.AuditService;
import com.smartcampus.service.ResourceService;
import org.springframework.security.core.context.SecurityContextHolder;
import com.smartcampus.model.Role;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketImageRepository ticketImageRepository;
    private final DatabaseSequenceRepository sequenceRepository;
    private final AuditService auditService;
    private final ResourceService resourceService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository, 
                         CommentRepository commentRepository, 
                         TicketImageRepository ticketImageRepository, 
                         DatabaseSequenceRepository sequenceRepository, 
                         AuditService auditService, 
                         ResourceService resourceService, 
                         UserRepository userRepository, 
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.ticketImageRepository = ticketImageRepository;
        this.sequenceRepository = sequenceRepository;
        this.auditService = auditService;
        this.resourceService = resourceService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Ticket createTicket(Ticket ticket) {
        System.out.println("DEBUG: Creating ticket for user: " + ticket.getUserId());
        System.out.println("DEBUG: User Full Name: " + ticket.getUserFullName());
        System.out.println("DEBUG: User Campus ID: " + ticket.getUserCampusId());
        
        // Generate Professional Short ID (e.g. TKT-1001)
        long seq = generateSequence("tickets_sequence");
        ticket.setDisplayId("TKT-" + (1000 + seq));
        
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        
        // Auto-detect priority before saving
        Priority detectedPriority = detectPriority(ticket.getTitle(), ticket.getDescription());
        if (detectedPriority == Priority.HIGH) {
            ticket.setPriority(Priority.HIGH);
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        System.out.println("DEBUG: Ticket saved successfully with ID: " + savedTicket.getId());
        
        // Log audit event
        try {
            System.out.println("DEBUG: About to call auditService.log() for ticket: " + savedTicket.getDisplayId());
            auditService.log(ticket.getUserId(), "TICKET_CREATED", "New ticket " + savedTicket.getDisplayId() + " created");
            System.out.println("DEBUG: Audit log call completed successfully");
        } catch (Exception e) {
            System.err.println("ERROR: Failed to log audit for ticket creation: " + e.getMessage());
            e.printStackTrace();
        }

        // Impact Booking: If a ticket is HIGH priority, set associated resource to MAINTENANCE
        if (savedTicket.getResourceId() != null && savedTicket.getPriority() == Priority.HIGH) {
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
        // Return only the latest 100 tickets for better performance
        return ticketRepository.findAll(
            org.springframework.data.domain.PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
    }

    public List<Ticket> getRecentTickets(int limit) {
        return ticketRepository.findAll(
            org.springframework.data.domain.PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
    }

    public java.util.Map<String, Long> getTechnicianStats(String techId) {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        
        stats.put("activeTickets", ticketRepository.countByStatusIn(
            List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED)));
        
        stats.put("myTickets", ticketRepository.countByTechnicianIdAndStatusIn(
            techId, List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)));
        
        stats.put("urgentTickets", ticketRepository.countByPriorityAndStatusIn(
            Priority.HIGH, List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)));
            
        stats.put("completedToday", ticketRepository.countByTechnicianIdAndStatusIn(
            techId, List.of(TicketStatus.RESOLVED, TicketStatus.CLOSED)));
            
        return stats;
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    public List<Ticket> getTicketsByUserId(String userId) {
        return ticketRepository.findByUserId(userId, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<Ticket> getTicketsByResourceId(String resourceId) {
        return ticketRepository.findByResourceId(resourceId);
    }

    public Ticket updateTicketStatus(String ticketId, TicketStatus newStatus, String updatedBy, String resolutionNote) {
        Ticket ticket = getTicketById(ticketId);
        User user = userRepository.findById(updatedBy).orElseThrow(() -> new RuntimeException("User not found"));
        TicketStatus oldStatus = ticket.getStatus();

        // 🛡️ ROLE-BASED SAFETY GUARDS
        if (user.getRole() == Role.TECHNICIAN) {
            // Technicians cannot self-close or cancel without admin
            if (newStatus == TicketStatus.CLOSED || newStatus == TicketStatus.REJECTED) {
                throw new RuntimeException("Technicians cannot officially CLOSE or REJECT tickets. Please set to RESOLVED for verification.");
            }
        }

        if (user.getRole() == Role.STUDENT || user.getRole() == Role.LECTURER) {
            // Students can only CLOSE if it's RESOLVED, or CANCEL (handled by REJECTED) if it's OPEN
            if (newStatus == TicketStatus.IN_PROGRESS && oldStatus != TicketStatus.RESOLVED) {
                throw new RuntimeException("Unauthorized status transition for your role.");
            }
            if (newStatus == TicketStatus.RESOLVED) {
                throw new RuntimeException("Only technical staff can mark a ticket as RESOLVED.");
            }
        }

        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());

        // Intelligence: Auto-Assign if a technician starts work or resolves an unassigned ticket
        if ((newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.IN_PROGRESS) && 
            (ticket.getTechnicianId() == null || ticket.getTechnicianId().isEmpty())) {
            if (user.getRole() == Role.TECHNICIAN) {
                ticket.setTechnicianId(updatedBy);
                ticket.setTechnicianFullName(user.getFullName());
                ticket.setTechnicianCampusId(user.getCampusId());
                ticket.setAssignmentMethod("SELF_CLAIMED");
                ticket.setAssignedAt(LocalDateTime.now());
            }
        }

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
            if (resolutionNote != null && !resolutionNote.isEmpty()) {
                ticket.setResolutionNotes(resolutionNote);
            }
        }

        // Handle Re-Opening (Backward Flow)
        if (oldStatus == TicketStatus.RESOLVED && newStatus == TicketStatus.IN_PROGRESS) {
            auditService.log(updatedBy, "TICKET_REOPENED", "Fix rejected by reporter. Ticket sent back to IN_PROGRESS.");
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        auditService.log(updatedBy, "TICKET_STATUS_UPDATED", "Ticket " + ticket.getDisplayId() + " status changed to " + newStatus);

        // Impact Booking: If a ticket is resolved or closed, check if we can set resource back to ACTIVE
        if ((newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.CLOSED) && ticket.getResourceId() != null) {
            // Check if there are ANY other HIGH priority OPEN or IN_PROGRESS tickets for this resource
            long openHighPriorityCount = ticketRepository.countByResourceIdAndStatusInAndPriority(
                ticket.getResourceId(), 
                List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
                Priority.HIGH
            );
            
            if (openHighPriorityCount == 0) {
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

        // Fetch technician details for professional identity enrichment
        User technician = userRepository.findById(technicianId).orElse(null);
        if (technician != null) {
            ticket.setTechnicianFullName(technician.getFullName());
            ticket.setTechnicianCampusId(technician.getCampusId());
            ticket.setAssignmentMethod("ADMIN_ASSIGNED");
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        
        String techLabel = (technician != null) 
            ? technician.getFullName() + " (" + technician.getCampusId() + ")" 
            : technicianId;
            
        auditService.log(assignedBy, "TICKET_ASSIGNED", "Ticket " + ticket.getDisplayId() + " assigned to technician " + techLabel);
        
        // --- REAL-TIME NOTIFICATION ---
        try {
            notificationService.send(com.smartcampus.dto.CreateNotificationRequest.builder()
                .userId(technicianId)
                .title("New Ticket Assigned 🔧")
                .message("You have been assigned to: " + ticket.getTitle() + " (" + ticket.getDisplayId() + ")")
                .type(com.smartcampus.model.NotificationType.TICKET_UPDATED)
                .priority(com.smartcampus.model.NotificationPriority.HIGH)
                .referenceId(ticketId)
                .build());
        } catch (Exception e) {
            System.err.println("Failed to send assignment notification: " + e.getMessage());
        }

        return updatedTicket;
    }

    public void deleteTicket(String id) {
        Ticket ticket = getTicketById(id);
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        
        auditService.log(adminId, "TICKET_DELETED", "Ticket " + ticket.getDisplayId() + " was permanently purged from the system");
        ticketRepository.deleteById(id);
    }

    // --- Comments Logic ---
    public Comment addComment(String ticketId, Comment comment) {
        comment.setTicketId(ticketId);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        
        // Identity Enrichment: Capture commenter identity at save time
        User commenter = userRepository.findById(comment.getUserId()).orElse(null);
        if (commenter != null) {
            comment.setUserFullName(commenter.getFullName());
            comment.setUserCampusId(commenter.getCampusId());
        }

        Comment savedComment = commentRepository.save(comment);
        
        Ticket ticket = getTicketById(ticketId);
        auditService.log(comment.getUserId(), "TICKET_COMMENT_ADDED", "New comment added to ticket " + ticket.getDisplayId());

        // --- REAL-TIME NOTIFICATION for Technician ---
        if (ticket.getTechnicianId() != null && !ticket.getTechnicianId().equals(comment.getUserId())) {
            try {
                notificationService.notifyTicketUpdated(
                    ticket.getTechnicianId(), 
                    ticket.getDisplayId(), 
                    "New comment added by " + savedComment.getUserFullName()
                );
            } catch (Exception e) {
                System.err.println("Failed to send comment notification: " + e.getMessage());
            }
        }

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

        auditService.log(uploadedBy, "TICKET_IMAGES_UPLOADED", "Uploaded " + fileNames.size() + " images to ticket " + ticket.getDisplayId());
        return savedImages;
    }

    public List<TicketImage> getImagesByTicketId(String ticketId) {
        return ticketImageRepository.findByTicketId(ticketId);
    }

    public java.util.Map<String, Long> getGlobalStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("open", ticketRepository.countByStatusIn(List.of(TicketStatus.OPEN)));
        stats.put("total", ticketRepository.count());
        return stats;
    }

    private long generateSequence(String seqName) {
        DatabaseSequence counter = sequenceRepository.findById(seqName).orElse(null);
        if (counter == null) {
            counter = new DatabaseSequence(seqName, 1);
        } else {
            counter.setSeq(counter.getSeq() + 1);
        }
        sequenceRepository.save(counter);
        return counter.getSeq();
    }
}
