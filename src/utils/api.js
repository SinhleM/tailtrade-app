// src/utils/api.js
import axios from 'axios'; //
import config from '../config'; //

// Create axios instance with default configuration
const api = axios.create({
  baseURL: config.API_BASE_URL, //
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json', //
  },
});

// Request interceptor (for adding auth tokens later if needed)
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here later
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;\
    // }\
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
    if (error.code === 'ECONNABORTED') { //
      console.error('Request timeout'); //
    } else if (error.response?.status === 401) { //
      // Handle unauthorized access
      localStorage.removeItem('user'); //
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post(config.endpoints.LOGIN, credentials); //
    return response.data; //
  },
  
  register: async (userData) => {
    const response = await api.post(config.endpoints.REGISTER, userData); //
    return response.data; //
  },
};

// MODIFIED Test connection function for specific CORS OPTIONS test
export const testConnection = async () => {
  try {
    const testUrl = `${config.API_BASE_URL}/test_cors.php`; // Target the new test script
    console.log(`Attempting OPTIONS request to: ${testUrl}`);
    const response = await fetch(testUrl, {
      method: 'OPTIONS', // This is the crucial part for testing preflight
    });

    console.log('OPTIONS request response status:', response.status);
    console.log('OPTIONS request response headers:');
    // Iterate over headers to log them all
    for (let pair of response.headers.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    if (response.ok) {
        console.log('OPTIONS request was OK. Now, carefully check the logs above for "access-control-allow-origin".');
    } else {
        console.error('OPTIONS request failed. Status:', response.status);
    }

    return response.ok;
  } catch (error) {
    console.error('Connection test failed (Network Error before response):', error);
    return false;
  }
};

export default api; //