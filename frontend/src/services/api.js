import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT = parseInt(import.meta.env.VITE_REQUEST_TIMEOUT || '30000', 10);
const MAX_RETRIES = 2;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT,
});

// Request interceptor - add cache-busting for non-GET requests
api.interceptors.request.use(
  (config) => {
    if (config.method !== 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject({
        success: false,
        message: 'Request timed out. Please try again.',
        status: 504,
        isTimeout: true,
      });
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
        status: 0,
        isNetworkError: true,
      });
    }

    // Handle server errors with retry
    if (error.response.status >= 500 && config._retryCount < MAX_RETRIES) {
      config._retryCount = (config._retryCount || 0) + 1;
      return api(config);
    }

    // Return structured error response
    return Promise.reject({
      success: false,
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      details: error.response.data?.details,
      isTimeout: false,
      isNetworkError: false,
    });
  }
);

export default api;
export { API_BASE };
