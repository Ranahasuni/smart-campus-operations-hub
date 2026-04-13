package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.Comment;
import com.smartcampus.model.TicketImage;
import com.smartcampus.service.TicketService;
import com.smartcampus.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Arrays;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin
public class TicketController {

    private final TicketService ticketService;
    private final FileService fileService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        return new ResponseEntity<>(ticketService.createTicket(ticket), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/resource/{resourceId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Ticket>> getByResource(@PathVariable String resourceId) {
        return ResponseEntity.ok(ticketService.getTicketsByResourceId(resourceId));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Ticket>> getTicketsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUserId(userId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> request) {
        TicketStatus status = TicketStatus.valueOf(request.get("status"));
        String updatedBy = request.getOrDefault("updatedBy", "SYSTEM");
        String resolutionNote = request.get("resolutionNote");
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, updatedBy, resolutionNote));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTechnician(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> request) {
        String technicianId = request.get("technicianId");
        String assignedBy = request.get("assignedBy");
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId, assignedBy));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
    }

    // --- Comments Endpoints (Secured) ---
    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public Comment addComment(@PathVariable String id, @RequestBody Comment comment) {
        return ticketService.addComment(id, comment);
    }

    @GetMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    public List<Comment> getComments(@PathVariable String id) {
        return ticketService.getCommentsByTicketId(id);
    }

    // --- Images Endpoints ---
    @PostMapping("/{id}/images")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketImage>> uploadImages(
            @PathVariable String id,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("userId") String userId) {
        
        List<String> storedFileNames = Arrays.stream(files)
                .map(fileService::storeFile)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(ticketService.saveImages(id, storedFileNames, userId));
    }

    @GetMapping("/{id}/images")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TicketImage>> getImages(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getImagesByTicketId(id));
    }
}
