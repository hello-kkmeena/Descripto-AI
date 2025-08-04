import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import UserService from '../services/userService';
import AuthService from '../services/authService';
import ApiService from '../services/apiService';
import { AUTH_ENDPOINTS } from '../config/apiConfig';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => UserService.getProfile());
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize user from localStorage
    useEffect(() => {
        const storedProfile = UserService.getProfile();
        if (storedProfile) {
            setUser(storedProfile);
        }
        setIsLoading(false);
    }, []);

    const checkAuthStatus = useCallback(async () => {
        // If we have a valid profile in localStorage, use it
        if (UserService.hasValidProfile()) {
            const profile = UserService.getProfile();
            setUser(profile);
            return;
        }

        try {
            const result = await ApiService.fetchWithAuth(AUTH_ENDPOINTS.PROFILE);
            if (result.success) {
                UserService.setProfile(result.data);
                setUser(result.data);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            if (error.message === 'Authentication failed') {
                // Only clear profile if authentication explicitly failed
                setUser(null);
                UserService.clearProfile();
            }
            setError(error.message);
        }
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            const result = await AuthService.login(credentials);
            if (result.success) {
                const profile = UserService.getProfile();
                setUser(profile);
                toast.success('Login successful');
                return { success: true, data: result.data };
            }
            throw new Error(result.message || 'Login failed');
        } catch (error) {
            setError(error.message);
            toast.error(error.message || 'Login failed');
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const result = await AuthService.register(userData);
            if (result.success) {
                const profile = UserService.getProfile();
                setUser(profile);
                toast.success('Registration successful');
                return { success: true, data: result.data };
            }
            throw new Error(result.message || 'Registration failed');
        } catch (error) {
            setError(error.message);
            toast.error(error.message || 'Registration failed');
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            setError(null);
            await AuthService.logout();
            setUser(null);
            UserService.clearProfile();
            toast.success('Logged out successfully', {
                position: "top-right",
                autoClose: 3000
            });
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Even if server logout fails, clear local state
            setUser(null);
            UserService.clearProfile();
            toast.error('Logout failed, but you have been logged out locally', {
                position: "top-right",
                autoClose: 5000
            });
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        error,
        isLoading,
        login,
        register,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider; 