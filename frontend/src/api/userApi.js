import api from './axiosInstance';

const userApi = {
  /** Get all users who have a specific role */
  getUsersByRole: (role) => api.get(`/users/role/${role}`),

  /** Get basic profile info for a user by ID */
  getUserById: (id) => api.get(`/users/${id}`),

  /** Get all users (ADMIN only) */
  getAllUsers: () => api.get('/users')
};

export default userApi;
