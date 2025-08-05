// API Base URLs
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'https://api.descripto.ai',
    API_VERSION: '/api/v1',
    AUTH_PREFIX: '/auth',
    GENERATE_PREFIX: '/generate',
};

// Construct full API URL
export const getApiUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};

// Auth Endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/login`),
    REGISTER: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/register`),
    LOGOUT: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/logout`),
    REFRESH: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/refresh`),
    PROFILE: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/profile`),
    VERIFY: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/verify`),
};

// Generation Endpoints
export const GENERATE_ENDPOINTS = {
    DESCRIPTION: getApiUrl(`${API_CONFIG.GENERATE_PREFIX}/description`),
    CHAT: getApiUrl(`${API_CONFIG.GENERATE_PREFIX}/chat`),
};

// Helper function to get any endpoint URL
export const getEndpointUrl = (endpointKey) => {
    // First check auth endpoints
    if (AUTH_ENDPOINTS[endpointKey]) {
        return AUTH_ENDPOINTS[endpointKey];
    }
    
    // Then check generate endpoints
    if (GENERATE_ENDPOINTS[endpointKey]) {
        return GENERATE_ENDPOINTS[endpointKey];
    }
    
    // If not found in predefined endpoints, construct from base URL
    return getApiUrl(`/${endpointKey.toLowerCase()}`);
};

// Request Headers
export const getDefaultHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
});

// Common Request Options
export const getRequestOptions = (method = 'GET', body = null) => {
    const options = {
        method,
        headers: getDefaultHeaders(),
        credentials: 'include', // Important for cookies
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    return options;
};

export default {
    API_CONFIG,
    AUTH_ENDPOINTS,
    GENERATE_ENDPOINTS,
    getApiUrl,
    getEndpointUrl,
    getDefaultHeaders,
    getRequestOptions,
};