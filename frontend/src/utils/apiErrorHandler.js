// API Error Handler Utility
// Provides consistent error handling across the application

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 401) {
      return 'Session expired. Please log in again.';
    } else if (status === 403) {
      return 'You do not have permission to perform this action.';
    } else if (status === 404) {
      return 'The requested resource was not found.';
    } else if (status === 429) {
      return 'Too many requests. Please try again later.';
    } else if (status >= 500) {
      return 'Server error. Please try again later.';
    } else if (data?.message) {
      return data.message;
    }
  } else if (error.request) {
    // Request made but no response received
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your connection and try again.';
    }
    return 'No response from server. Please check your internet connection.';
  }
  
  return defaultMessage || error.message || 'An unknown error occurred';
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isTimeoutError = (error) => {
  return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
};

export const getErrorStatusCode = (error) => {
  return error.response?.status || null;
};
