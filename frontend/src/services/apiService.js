import TokenService from './tokenService';
import UserService from './userService';
import { AUTH_ENDPOINTS, getRequestOptions } from '../config/apiConfig';
import { toast } from 'react-toastify';

class ApiService {
    static async fetchWithAuth(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                ...getRequestOptions(options.method || 'GET', options.body),
                ...options,
                headers: {
                    ...getRequestOptions().headers,
                    ...options.headers
                },
                credentials: 'include' // Important for cookies
            });

            // Only attempt token refresh on 401 status
            if (response.status === 401) {
                const retryCount = UserService.incrementRefreshCount();
                
                if (retryCount <= UserService.REFRESH_RETRY_LIMIT) {
                    const refreshed = await this.handleTokenRefresh();
                    
                    if (refreshed) {
                        // If refresh successful, retry the original request
                        return this.fetchWithAuth(endpoint, options);
                    }
                }
                
                // If refresh failed or retry limit exceeded, handle auth failure
                this.handleAuthFailure();
                throw new Error('Authentication failed');
            }

            // For non-401 errors, handle normally
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Request failed');
            }

            const result = await response.json();
            
            // Reset retry count on successful response
            UserService.resetRefreshCount();

            if (!result.success) {
                throw new Error(result.message || 'API request failed');
            }

            return result;
        } catch (error) {
            if (error.message === 'Authentication failed') {
                throw error;
            }
            console.error('API request failed:', error);
            throw new Error(error.message || 'API request failed');
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