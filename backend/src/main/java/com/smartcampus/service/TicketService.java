package com.smartcampus.service;

import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;

    // Empty skeleton! All our heavy lifting logic will go here in Phase 1.
}
