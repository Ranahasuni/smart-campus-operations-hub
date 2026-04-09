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
    private String userFullName;
    private String userCampusId;
    private String displayId; // Human-readable sequential ID (e.g. #TKT-1001)
    private String resourceId; // The broken resource

    private String title;
    private IssueType issueType;
    private String description;

    // --- Top Marks Feature ---
    private String contactDetails;
    private String locationDetail; // e.g. "Second row, desk 3"
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
    
    /** Helper to check if ticker is finalized */
    public boolean isResolved() {
        return this.status == TicketStatus.RESOLVED;
    }
}
