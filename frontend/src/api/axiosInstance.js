import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8082/api',
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Retry logic for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retryRequest = async (config, retryCount = 0) => {
  try {
    return await axios(config);
  } catch (error) {
    if (
      retryCount < MAX_RETRIES &&
      (error.code === 'ECONNABORTED' || // timeout
        error.code === 'ENOTFOUND' || // DNS failure
        error.code === 'ECONNREFUSED' || // connection refused
        (error.response?.status >= 500 && error.response?.status < 600)) // server error
    ) {
      console.warn(`Request failed, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

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
