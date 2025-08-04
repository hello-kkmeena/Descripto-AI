import TokenService from './tokenService';
import UserService from './userService';
import ApiService from './apiService';
import { AUTH_ENDPOINTS, getRequestOptions } from '../config/apiConfig';

class AuthService {
    static async login(credentials) {
        try {
            const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
                ...getRequestOptions('POST', credentials)
            });

            const result = await response.json();

            if (result.success) {
                const { accessToken, refreshToken } = result.data;
                
                // Set tokens
                TokenService.setTokens(accessToken, refreshToken);
                
                // Fetch and store user profile
                await ApiService.refreshUserProfile();
                
                return { success: true, data: result.data };
            }
            
            throw new Error(result.message || 'Login failed');
        } catch (error) {
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
                ...getRequestOptions('POST', userData)
            });

            const result = await response.json();

            if (result.success) {
                const { accessToken, refreshToken } = result.data;
                
                // Set tokens
                TokenService.setTokens(accessToken, refreshToken);
                
                // Fetch and store user profile
                await ApiService.refreshUserProfile();
                
                return { success: true, data: result.data };
            }
            
            throw new Error(result.message || 'Registration failed');
        } catch (error) {
            throw error;
        }
    }

    static async logout() {
        try {
            const response = await fetch(AUTH_ENDPOINTS.LOGOUT, {
                method: 'POST',
                credentials: 'include'
            });

            // Check if response is ok (status in the range 200-299)
            if (!response.ok) {
                throw new Error('Logout request failed');
            }

            // Only try to parse JSON if the content-type is application/json
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message || 'Logout failed');
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local data even if server request fails
            throw error;
        } finally {
            // Always clear local data
            TokenService.clearTokens();
            UserService.clearProfile();
        }
    }
}

export default AuthService; 