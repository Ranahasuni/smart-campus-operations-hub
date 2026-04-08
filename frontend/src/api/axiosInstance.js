import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  withCredentials: true,
});

// Interceptor to automatically add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle session expiration (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sc_token');
      localStorage.removeItem('sc_user');
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;
