// src/utils/api.js
import axios from 'axios';
import config from '../config';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (for adding auth tokens later if needed)
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here later
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for handling common errors)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('user');
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post(config.endpoints.LOGIN, credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post(config.endpoints.REGISTER, userData);
    return response.data;
  },
};

// Test connection function
export const testConnection = async () => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/login.php`, {
      method: 'OPTIONS',
    });
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

export default api;