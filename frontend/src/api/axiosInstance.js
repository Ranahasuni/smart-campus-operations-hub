import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  withCredentials: true,
});

// Intercept all requests and attach the JWT token if logged in
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

export default api;
