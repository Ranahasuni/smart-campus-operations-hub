package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    /** Fetch all maintenance requests */
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    /** Find tickets for a specific room/resource */
    public List<Ticket> getTicketsByResourceId(String resourceId) {
        return ticketRepository.findAll().stream()
                .filter(t -> t.getResourceId() != null && t.getResourceId().equals(resourceId))
                .toList();
    }

    /** Update ticket workflow status */
    public Ticket updateStatus(String id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
        
        ticket.setStatus(status);
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    /** Create a new manual ticket */
    public Ticket createTicket(Ticket ticket) {
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setStatus(ticket.getStatus() != null ? ticket.getStatus() : TicketStatus.OPEN);
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id) {
        ticketRepository.deleteById(id);
    }
}
