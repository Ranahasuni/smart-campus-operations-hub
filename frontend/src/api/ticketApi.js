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

  // Get tickets for a specific resource
  getTicketsByResourceId: (resourceId) => api.get(`/tickets/resource/${resourceId}`),

  // Get comments for a ticket
  getComments: (ticketId) => api.get(`/tickets/${ticketId}/comments`),

  // Add a comment to a ticket
  addComment: (ticketId, commentData) => api.post(`/tickets/${ticketId}/comments`, commentData),

  // Update a ticket's status (PATCH with JSON body)
  updateTicketStatus: (id, status, updatedBy, resolutionNote) => 
    api.patch(`/tickets/${id}/status`, { status, updatedBy, resolutionNote }),

  // Assign a technician to a ticket (PATCH with JSON body)
  assignTechnician: (id, technicianId, assignedBy) => 
    api.patch(`/tickets/${id}/assign`, { technicianId, assignedBy }),
  // --- Image Handling ---
  uploadTicketImages: (ticketId, files, userId) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('userId', userId);
    
    return api.post(`/tickets/${ticketId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getTicketImages: (ticketId) => api.get(`/tickets/${ticketId}/images`)
};

export default ticketApi;
