import api from './axiosInstance';

const ticketApi = {
  // Create a new Maintenance Ticket
  createTicket: (ticketData) => api.post('/tickets', ticketData),

  // Get all tickets (for Admins/Technicians)
  getAllTickets: () => api.get('/tickets'),

  // Get tickets for a specific user
  getTicketsByUser: (userId) => api.get(`/tickets/user/${userId}`),

  // Get a single ticket by ID
  getTicketById: (id) => api.get(`/tickets/${id}`),

  // Update a ticket's status (PATCH with JSON body)
  updateTicketStatus: (id, status, updatedBy, resolutionNote) => 
    api.patch(`/tickets/${id}/status`, { status, updatedBy, resolutionNote }),

  // Assign a technician to a ticket (PATCH with JSON body)
  assignTechnician: (id, technicianId, assignedBy) => 
    api.patch(`/tickets/${id}/assign`, { technicianId, assignedBy })
};

export default ticketApi;
