import TokenService from './tokenService';
import UserService from './userService';
import ApiService from './apiService';
import { AUTH_ENDPOINTS } from '../config/apiConfig';

class AuthService {
    static async login(credentials) {
        try {
            const result = await ApiService.fetchWithoutAuth(AUTH_ENDPOINTS.LOGIN, {
                method: 'POST',
                body: credentials,
                requestKey: 'auth:login',
                cancelPrevious: true
            });

            if (result.success) {
                const { accessToken, refreshToken } = result.data || {};
                if (accessToken && refreshToken) {
                    TokenService.setTokens(accessToken, refreshToken);
                }
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
            const result = await ApiService.fetchWithoutAuth(AUTH_ENDPOINTS.REGISTER, {
                method: 'POST',
                body: userData,
                requestKey: 'auth:register',
                cancelPrevious: true
            });

            if (result.success) {
                const { accessToken, refreshToken } = result.data || {};
                if (accessToken && refreshToken) {
                    TokenService.setTokens(accessToken, refreshToken);
                }
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
            const result = await ApiService.fetchWithAuth(AUTH_ENDPOINTS.LOGOUT, {
                method: 'POST',
                requestKey: 'auth:logout',
                cancelPrevious: true
            });
            // If backend returns success flag, honor it; else assume OK if no error thrown
            if (result && result.success === false) {
                throw new Error(result.message || 'Logout failed');
            }
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        } finally {
            TokenService.clearTokens();
            UserService.clearProfile();
        }
    }
}

export default AuthService; 