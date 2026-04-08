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

  // Update a ticket's status (using patch with request params)
  updateTicketStatus: (id, status, updatedBy) => 
    api.patch(`/tickets/${id}/status`, null, { params: { status, updatedBy } }),

  // Assign a technician to a ticket
  assignTechnician: (id, technicianId, assignedBy) => 
    api.patch(`/tickets/${id}/assign`, null, { params: { technicianId, assignedBy } })
};

export default ticketApi;
