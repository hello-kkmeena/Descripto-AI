// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.descripto.ai';
const API_CONTEXT_PATH = process.env.API_CONTEXT_PATH || '/api/v1';

export const getEndpointUrl = (endpoint) => {
  const endpoints = {
    GENERATE_DESCRIPTION: `${API_BASE_URL}${API_CONTEXT_PATH}/generate-description`,
    LOGIN: `${API_BASE_URL}${API_CONTEXT_PATH}/auth/login`,
    REGISTER: `${API_BASE_URL}${API_CONTEXT_PATH}/auth/register`,
    LOGOUT: `${API_BASE_URL}${API_CONTEXT_PATH}/auth/logout`,
    VERIFY_TOKEN: `${API_BASE_URL}${API_CONTEXT_PATH}/auth/verify`,
  };
  
  return endpoints[endpoint] || `${API_BASE_URL}${API_CONTEXT_PATH}/${endpoint.toLowerCase()}`;
};

export default {
  baseURL: API_BASE_URL,
  contextPath: API_CONTEXT_PATH,
  getEndpointUrl,
}; 