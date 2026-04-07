package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "ticket_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketImage {

    @Id
    private String id;

    private String ticketId;

    private String imageUrl; // URL to the image (e.g. AWS or Cloudinary)
    private String caption; // Description of what the photo shows
    private String uploadedBy; // User ID of who uploaded the image

    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
