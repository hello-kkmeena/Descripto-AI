# Changelog

## [Unreleased]

### Added
- Centralized API configuration in `apiConfig.js`
- Toast notifications for authentication failures
- User profile management in localStorage
- Token refresh retry mechanism with delay
- Comprehensive authentication documentation

### Changed
- Removed loading screen from initial auth check
- Updated auth flow to be more resilient
- Improved error handling with toast notifications
- Centralized API URL management
- Enhanced token refresh mechanism with retry delay

### Security
- Implemented HTTP-only cookies for token storage
- Added secure and SameSite cookie options
- Improved CORS configuration
- Enhanced token refresh flow

### Code Structure
- Created dedicated service layers:
  - `TokenService` for token management
  - `UserService` for profile handling
  - `ApiService` for API communication
  - `AuthService` for authentication operations
- Centralized API configuration
- Improved error handling strategy

### Dependencies Added
- `react-toastify` for notifications

## [1.0.0] - Initial Release

### Features
- User authentication (login/register)
- Product description generation
- Modern UI design
- Responsive layout
- Basic error handling 