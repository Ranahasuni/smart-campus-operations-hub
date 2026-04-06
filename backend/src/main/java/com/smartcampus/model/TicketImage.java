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

    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
