# Authentication System Documentation

## Overview
This document outlines the authentication system implemented in the Descripto AI application, including the token management, user profile handling, and API communication structure.

## Table of Contents
1. [Architecture](#architecture)
2. [Configuration](#configuration)
3. [Services](#services)
4. [Authentication Flow](#authentication-flow)
5. [Error Handling](#error-handling)
6. [Code Structure](#code-structure)

## Architecture

### Key Components
- **Token Management**: HTTP-only cookies for secure token storage
- **Profile Management**: LocalStorage for user profile data
- **API Communication**: Centralized configuration and interceptors
- **Error Handling**: Toast notifications and automatic retry mechanism

### File Structure
```
frontend/
├── src/
│   ├── config/
│   │   └── apiConfig.js       # Centralized API configuration
│   ├── services/
│   │   ├── apiService.js      # API communication handling
│   │   ├── authService.js     # Authentication operations
│   │   ├── tokenService.js    # Token management
│   │   └── userService.js     # User profile management
│   ├── context/
│   │   └── AuthContext.js     # Global auth state management
│   └── components/
│       └── auth/
│           └── AuthModal.js   # Authentication UI
```

## Configuration

### API Configuration (apiConfig.js)
```javascript
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    API_VERSION: '/api/v1',
    AUTH_PREFIX: '/auth',
    GENERATE_PREFIX: '/generate'
};

export const AUTH_ENDPOINTS = {
    LOGIN: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/login`),
    REGISTER: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/register`),
    LOGOUT: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/logout`),
    REFRESH: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/refresh`),
    PROFILE: getApiUrl(`${API_CONFIG.AUTH_PREFIX}/profile`)
};
```

## Services

### TokenService
- Manages access and refresh tokens
- Uses HTTP-only cookies for secure storage
- Handles token setting and clearing

```javascript
static COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/'
};
```

### UserService
- Manages user profile data
- Uses localStorage for profile storage
- Handles refresh token retry counting

```javascript
static PROFILE_KEY = 'user_profile';
static REFRESH_RETRY_LIMIT = 3;
```

### ApiService
- Handles authenticated API requests
- Implements token refresh mechanism
- Manages request retries and error handling

## Authentication Flow

### Login/Register Flow
1. User submits credentials
2. Server validates and returns tokens + profile
3. Tokens stored in HTTP-only cookies
4. Profile stored in localStorage
5. AuthContext updated with user state

### Token Refresh Flow
1. API call returns 401 (Unauthorized)
2. System attempts token refresh
3. If successful:
   - New tokens stored
   - Original request retried
4. If unsuccessful after retries:
   - User notified via toast
   - Auth state cleared
   - User can continue browsing

### Error Handling
- Toast notifications for auth failures
- Automatic retry mechanism with delays
- Graceful degradation of auth state

```javascript
static handleAuthFailure() {
    TokenService.clearTokens();
    UserService.clearProfile();
    toast.error('Your session has expired. Please login again.');
}
```

## Error Handling

### Types of Errors
1. **Authentication Failures**
   - Invalid credentials
   - Expired tokens
   - Failed refresh attempts

2. **Network Errors**
   - API unavailable
   - Timeout issues
   - CORS problems

3. **Validation Errors**
   - Invalid input
   - Missing required fields
   - Format issues

### Error Handling Strategy
- User-friendly toast notifications
- Automatic retry for recoverable errors
- Graceful degradation of functionality
- Clear error messages and recovery options

## Code Structure

### AuthContext
- Global authentication state
- User profile management
- Auth operation methods

### API Services
- Centralized API configuration
- Consistent error handling
- Automatic token refresh
- Request retry mechanism

### Security Considerations
- HTTP-only cookies for tokens
- Secure and SameSite cookie options
- Profile data encryption (if needed)
- CORS configuration

## Usage Examples

### Making Authenticated API Calls
```javascript
// Using ApiService
const result = await ApiService.fetchWithAuth(AUTH_ENDPOINTS.PROFILE);

// Using AuthService
const loginResult = await AuthService.login(credentials);
```

### Handling Auth State
```javascript
// In components
const { user, isAuthenticated } = useAuth();

// Conditional rendering
{isAuthenticated ? <UserDashboard /> : <PublicContent />}
```

### Error Handling
```javascript
try {
    await ApiService.fetchWithAuth(endpoint);
} catch (error) {
    // Toast notification shown automatically
    console.error('API call failed:', error);
}
```

## Best Practices

1. **Security**
   - Always use HTTP-only cookies for tokens
   - Implement proper CORS policies
   - Validate all user input

2. **Error Handling**
   - Provide clear error messages
   - Implement graceful degradation
   - Log errors appropriately

3. **State Management**
   - Keep auth state centralized
   - Use proper React hooks
   - Implement proper cleanup

4. **Code Organization**
   - Follow service-based architecture
   - Keep configuration centralized
   - Maintain clear documentation

## Future Improvements

1. **Features**
   - Implement remember me functionality
   - Add multi-factor authentication
   - Enhanced session management

2. **Security**
   - Add rate limiting
   - Implement IP-based blocking
   - Enhanced token rotation

3. **User Experience**
   - Offline support
   - Better error recovery
   - Enhanced loading states 