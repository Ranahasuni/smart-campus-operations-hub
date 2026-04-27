import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8082/api',
  withCredentials: true,
  timeout: 10000, 
});

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;


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

// Interceptor to handle session expiration (401 Unauthorized) and Retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;

    // 1. Session Expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('sc_token');
      localStorage.removeItem('sc_user');
      window.location.href = '/login?expired=true';
      return Promise.reject(error);
    }

    // 2. Retry Logic
    if (!config || !config.retry) {
        // Default to retrying unless explicitly disabled
        config.retry = MAX_RETRIES;
        config.retryCount = 0;
    }

    if (config.method !== 'get' && config.retryCount < config.retry && 
        (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || (error.response?.status >= 500))) {
        
        config.retryCount += 1;
        console.warn(`API Error: ${error.message}. Retrying ${config.retryCount}/${config.retry}...`);
        
        // Exponential backoff
        const backoff = new Promise((resolve) => {
            setTimeout(() => resolve(), RETRY_DELAY * config.retryCount);
        });
        
        await backoff;
        return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
