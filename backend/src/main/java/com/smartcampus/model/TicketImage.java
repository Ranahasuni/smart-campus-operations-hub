package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "ticket_images")
public class TicketImage {

    @Id
    private String id;

    private String ticketId;

    private String imageUrl; // URL to the image (e.g. AWS or Cloudinary)
    private String caption; // Description of what the photo shows
    private String uploadedBy; // User ID of who uploaded the image

    private LocalDateTime uploadedAt = LocalDateTime.now();

    public TicketImage() {
    }

    public TicketImage(String id, String ticketId, String imageUrl, String caption, String uploadedBy, LocalDateTime uploadedAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt != null ? uploadedAt : LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public static TicketImageBuilder builder() {
        return new TicketImageBuilder();
    }

    public static class TicketImageBuilder {
        private String id;
        private String ticketId;
        private String imageUrl;
        private String caption;
        private String uploadedBy;
        private LocalDateTime uploadedAt = LocalDateTime.now();

        TicketImageBuilder() {}

        public TicketImageBuilder id(String id) { this.id = id; return this; }
        public TicketImageBuilder ticketId(String ticketId) { this.ticketId = ticketId; return this; }
        public TicketImageBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public TicketImageBuilder caption(String caption) { this.caption = caption; return this; }
        public TicketImageBuilder uploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; return this; }
        public TicketImageBuilder uploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; return this; }

        public TicketImage build() {
            return new TicketImage(id, ticketId, imageUrl, caption, uploadedBy, uploadedAt);
        }
    }
}
