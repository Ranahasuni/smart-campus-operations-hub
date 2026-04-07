package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    private String id;

    private String userId; // User who created the ticket
    private String resourceId; // The broken resource

    private IssueType issueType;
    private String description;

    // --- Top Marks Feature ---
    private String contactDetails;
    // -------------------------

    @Builder.Default
    @Indexed
    private TicketStatus status = TicketStatus.OPEN;

    @Indexed
    private Priority priority;

    private String technicianId; // Assigned technician

    // --- Top Marks Feature ---
    private String resolutionNotes;
    private String rejectionReason;
    // -------------------------

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    // --- SLA Timer Features ---
    private LocalDateTime assignedAt;
    private LocalDateTime resolvedAt;
}
