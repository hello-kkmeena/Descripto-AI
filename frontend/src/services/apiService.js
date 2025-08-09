import TokenService from './tokenService';
import UserService from './userService';
import { AUTH_ENDPOINTS, API_CONFIG } from '../config/apiConfig';
import { toast } from 'react-toastify';
import axios from 'axios';

export const AGENT_ENDPOINTS = {
    GENERATE: '/api/v1/generate/agent'
};



// In-flight request registry keyed by requestKey to support cancellation and timeouts
const requestCancelRegistry = new Map();

const beginRequest = (requestKey, cancelPrevious, timeoutMs) => {
    if (requestKey && cancelPrevious && requestCancelRegistry.has(requestKey)) {
        const prev = requestCancelRegistry.get(requestKey);
        prev.controller.abort();
        clearTimeout(prev.timeoutId);
        requestCancelRegistry.delete(requestKey);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs || API_CONFIG.TIMEOUT_MS);
    if (requestKey) {
        requestCancelRegistry.set(requestKey, { controller, timeoutId });
    }
    return { signal: controller.signal, timeoutId };
};

const finalizeRequest = (requestKey, timeoutId) => {
    if (requestKey && requestCancelRegistry.has(requestKey)) {
        const entry = requestCancelRegistry.get(requestKey);
        clearTimeout(entry.timeoutId);
        requestCancelRegistry.delete(requestKey);
    } else if (timeoutId) {
        clearTimeout(timeoutId);
    }
};

class ApiService {

    static async fetchWithAuth(endpoint, options = {}) {
        const { method = 'GET', body, headers = {}, requestKey, cancelPrevious = false, timeoutMs } = options;
        const { signal, timeoutId } = beginRequest(requestKey, cancelPrevious, timeoutMs);
        try {
            const response = await axios.request({
                url: endpoint,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...headers
                },
                data: body,
                withCredentials: true,
                signal,
                timeout: timeoutMs || API_CONFIG.TIMEOUT_MS
            });

            const result = response.data;
            // Reset retry count on successful response
            UserService.resetRefreshCount();
            if (!result.success) {
                throw new Error(result.message || 'API request failed');
            }
            return result;
        } catch (error) {
            // Handle 401 with token refresh
            if (error?.response?.status === 401) {
                const retryCount = UserService.incrementRefreshCount();
                if (retryCount <= UserService.REFRESH_RETRY_LIMIT) {
                    const refreshed = await this.handleTokenRefresh();
                    if (refreshed) {
                        finalizeRequest(requestKey, timeoutId);
                        return this.fetchWithAuth(endpoint, options);
                    }
                }
                this.handleAuthFailure();
                throw new Error('Authentication failed');
            }
            // Propagate cancellation/timeout as AbortError
            if (axios.isCancel(error) || error.code === 'ECONNABORTED') {
                const abortErr = new Error('Request cancelled');
                abortErr.name = 'AbortError';
                throw abortErr;
            }
            console.error('API request failed:', error);
            throw new Error(error?.response?.data?.message || error.message || 'API request failed');
        } finally {
            finalizeRequest(requestKey, timeoutId);
        }
    }

    static async fetchWithoutAuth(endpoint, options = {}) {
        const { method = 'GET', body, headers = {}, requestKey, cancelPrevious = false, timeoutMs } = options;
        const { signal, timeoutId } = beginRequest(requestKey, cancelPrevious, timeoutMs);
        try {
            const response = await axios.request({
                url: endpoint,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...headers
                },
                data: body,
                signal,
                timeout: timeoutMs || API_CONFIG.TIMEOUT_MS
            });
            const result = response.data;
            if (!result.success) {
                throw new Error(result.message || 'API request failed');
            }
            return result;
        } catch (error) {
            if (axios.isCancel(error) || error.code === 'ECONNABORTED') {
                const abortErr = new Error('Request cancelled');
                abortErr.name = 'AbortError';
                throw abortErr;
            }
            console.error('API request failed:', error);
            throw new Error(error?.response?.data?.message || error.message || 'API request failed');
        } finally {
            finalizeRequest(requestKey, timeoutId);
        }
    }

    static async handleTokenRefresh() {
        try {
            const response = await fetch(AUTH_ENDPOINTS.REFRESH, {
                method: 'POST',
                credentials: 'include' // Important for cookies
            });

            // If refresh token is expired or invalid
            if (response.status === 401 || response.status === 400) {
                this.handleAuthFailure(true);
                return false;
            }

            if (!response.ok) {
                return false;
            }

            const result = await response.json();
            if (result.success) {
                // Cookies will be set by the server
                return true;
            }

            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    static async refreshUserProfile() {
        try {
            // Check if we already have a valid profile
            if (UserService.hasValidProfile()) {
                return true;
            }

            const result = await this.fetchWithAuth(AUTH_ENDPOINTS.PROFILE);
            if (result.success) {
                UserService.setProfile(result.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Profile refresh failed:', error);
            return false;
        }
    }

    static handleAuthFailure(isRefreshTokenExpired = false) {
        TokenService.clearTokens();
        UserService.clearProfile();
        
        const message = isRefreshTokenExpired
            ? 'Your session has expired. Please login again.'
            : 'Authentication failed. Please try again.';

        toast.error(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });

        // If refresh token is expired, redirect to login without page reload
        if (isRefreshTokenExpired) {
            window.history.pushState({}, '', '/login');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }
}

export default ApiService; 