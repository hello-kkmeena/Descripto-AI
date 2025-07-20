// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getEndpointUrl = (endpoint) => {
  const endpoints = {
    GENERATE_DESCRIPTION: `${API_BASE_URL}/generate-description`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    VERIFY_TOKEN: `${API_BASE_URL}/auth/verify`,
  };
  
  return endpoints[endpoint] || `${API_BASE_URL}/api/${endpoint.toLowerCase()}`;
};

export default {
  baseURL: API_BASE_URL,
  getEndpointUrl,
}; 