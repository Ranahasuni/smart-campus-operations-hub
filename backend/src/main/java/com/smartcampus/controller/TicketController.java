package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        return new ResponseEntity<>(ticketService.createTicket(ticket), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUserId(userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable String id,
            @RequestParam TicketStatus status,
            @RequestParam String updatedBy) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, updatedBy));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String id,
            @RequestParam String technicianId,
            @RequestParam String assignedBy) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId, assignedBy));
    }
}
