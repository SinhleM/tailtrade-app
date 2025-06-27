// src/config.js
const config = {
  // Production API URL for your InfinityFree backend
  API_BASE_URL: 'https://my-php-api-proxy.onrender.com',
  
  // Frontend URL (your Netlify domain)
  FRONTEND_URL: 'https://tailtrade.netlify.app',
  
  // API endpoints
  endpoints: {
    LOGIN: 'Login.php',
    REGISTER: 'Register.php',
    // Add other endpoints as needed
  }
};

export default config;