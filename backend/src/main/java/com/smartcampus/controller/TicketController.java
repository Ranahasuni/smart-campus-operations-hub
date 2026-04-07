package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<List<Ticket>> getAll() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<Ticket>> getByResource(@PathVariable String resourceId) {
        return ResponseEntity.ok(ticketService.getTicketsByResourceId(resourceId));
    }

    @PostMapping
    public ResponseEntity<Ticket> create(@RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.createTicket(ticket));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable String id,
            @RequestParam TicketStatus status) {
        return ResponseEntity.ok(ticketService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
