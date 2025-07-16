// API Configuration
const API_CONFIG = {
  // Get API URL from environment variable with fallback
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  
  // API endpoints
  ENDPOINTS: {
    GENERATE_DESCRIPTION: '/generate-description',
  },
  
  // Request timeout (in milliseconds)
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get specific endpoint URL
export const getEndpointUrl = (endpointName) => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointName];
  if (!endpoint) {
    throw new Error(`Unknown endpoint: ${endpointName}`);
  }
  return getApiUrl(endpoint);
};

export default API_CONFIG; 