import React, { createContext, useContext, useState, useCallback } from 'react';
import { getEndpointUrl } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await fetch(getEndpointUrl('LOGIN'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data and token
      setUser(data.user);
      if (data.access_token) {
        localStorage.setItem('authToken', data.access_token);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(getEndpointUrl('REGISTER'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          password: userData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store user data and token
      setUser(data.user);
      if (data.access_token) {
        localStorage.setItem('authToken', data.access_token);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Call logout endpoint to invalidate token on server
        await fetch(getEndpointUrl('LOGOUT'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Clear local storage and user state
      localStorage.removeItem('authToken');
      setUser(null);
      setAuthChecked(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local state
      localStorage.removeItem('authToken');
      setUser(null);
      setAuthChecked(false);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already logged in on app start
  // Note: React Strict Mode intentionally double-invokes effects in development
  // to help detect side effects. We use authChecked flag to prevent duplicate API calls.
  const checkAuthStatus = useCallback(async () => {
    // Prevent multiple calls in React Strict Mode
    if (authChecked) {
      console.log('Auth already checked, skipping...');
      return;
    }
    
    console.log('Checking auth status...');
    setAuthChecked(true);
    
    const token = localStorage.getItem('authToken');
    console.log('Token found:', !!token);
    
    if (token) {
      try {
        console.log('Making verify request to:', getEndpointUrl('VERIFY_TOKEN'));
        const response = await fetch(getEndpointUrl('VERIFY_TOKEN'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Verify response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('User data received:', JSON.stringify(data));
          setUser(data.user);
        } else {
          console.log('Token verification failed, clearing token');
          // Token is invalid, clear it
          localStorage.removeItem('authToken');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } else {
      console.log('No token found, user not authenticated');
      setUser(null);
    }
  }, [authChecked]);

  // Get auth token for API calls
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuthStatus,
    getAuthToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 