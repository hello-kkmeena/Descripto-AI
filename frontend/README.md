# Descripto-AI Frontend

React-based frontend for the Descripto-AI application that provides a user interface for generating E-commerce product descriptions with user authentication.

## Overview

The frontend is built with React and provides a modern, intuitive interface for users to register, login, and generate AI-powered product descriptions. It communicates with the Flask backend API to process authentication requests and description generation.

## Features

- **User Authentication**: Complete registration and login system
- **AI-Powered Descriptions**: Generate product descriptions using Google Gemini AI
- **Description Management**: View, regenerate, and delete generated descriptions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Form validation with immediate feedback
- **Error Handling**: Comprehensive error handling and user feedback
- **Token-based Authentication**: Secure JWT token management

## Directory Structure

```
frontend/
├── public/               # Public assets
│   └── index.html        # HTML template
├── src/                  # Source code
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   │   ├── AuthModal.js           # Login/Register modal
│   │   │   └── SuccessNotification.js # Success notifications
│   │   ├── DescriptionForm.js         # Form for product details
│   │   ├── DescriptionResults.js      # Component to display results
│   │   ├── Header.js                  # Navigation header
│   │   ├── Footer.js                  # Footer component
│   │   └── ErrorBoundary.js           # Error boundary component
│   ├── context/          # React context
│   │   └── AuthContext.js # Authentication context
│   ├── config/           # Configuration files
│   │   └── api.js        # API configuration
│   ├── App.js            # Main application component
│   ├── index.css         # Main application styles
│   └── index.js          # Application entry point
├── .env                  # Environment variables (not in repository)
├── package.json          # Project dependencies and scripts
└── README.md             # This file
```

## Components

### Authentication Components

#### AuthModal
- Handles user registration and login
- Form validation with real-time feedback
- Error handling and success notifications
- Responsive design for all screen sizes

#### SuccessNotification
- Displays success messages after authentication
- Auto-dismissing notifications
- Smooth animations and transitions

### Core Components

#### DescriptionForm
This component renders a form with the following inputs:
- Product title input field
- Product features textarea
- Tone selection dropdown (professional, fun, friendly)
- Generate button with loading states
- Real-time validation and error display

The form collects user input and sends it to the backend API when the user clicks the "Generate Descriptions" button.

#### DescriptionResults
This component displays the list of generated descriptions returned from the API. It renders:
- Generated descriptions with metadata (title, features, tone)
- Copy-to-clipboard functionality
- Regenerate functionality for individual descriptions
- Delete functionality for removing descriptions
- Responsive card layout with animations

#### Header
- Navigation bar with authentication status
- Login/Register buttons
- User profile information when logged in
- Logout functionality

#### Footer
- Application footer with links and information
- Responsive design

## Authentication System

### Features
- **JWT Token Management**: Secure token storage in localStorage
- **Auto-login**: Checks for existing valid tokens on app start
- **Token Verification**: Validates tokens with backend API
- **Session Management**: Handles login/logout states
- **Error Handling**: Comprehensive error handling for auth failures

### API Endpoints Used
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/verify` - Token verification

## Environment Configuration

The frontend requires an environment file (`.env`) with the following variables:

### Development Environment
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Development Configuration
REACT_APP_ENV=development
```

### Production Environment
```env
# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com

# Production Configuration
REACT_APP_ENV=production
```

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Flask backend running on port 5000

### Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create an environment file:
   ```
   cp .env.example .env
   ```
   Edit `.env` to configure the backend API URL.

3. Ensure the Flask backend is running:
   ```
   cd ../backend
   python app.py
   ```

### Running

Start the development server:

```
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

```
npm run build
```

This will create an optimized build in the `build` directory.

## Testing

```
npm test
```

## API Integration

The frontend communicates with the Flask backend through the following endpoints:

### Authentication Endpoints
- **Register**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **Logout**: `POST /auth/logout`
- **Verify Token**: `GET /auth/verify`

### Description Generation
- **Generate Descriptions**: `POST /generate-description`

The API configuration is managed in `src/config/api.js` and includes:
- Base URL configuration
- Endpoint definitions
- Authentication token management

## State Management

### Authentication Context
- Manages user authentication state
- Handles login/logout operations
- Provides authentication status to components
- Manages JWT tokens

### Local State
- Form data and validation
- Loading states
- Error handling
- Description history

## Customization

### Styling
The main styling uses Tailwind CSS with custom CSS variables. You can modify:
- `src/index.css` - Global styles and CSS variables
- Component-specific styles in each component

### Adding New Features
To add new form fields or options:
1. Update the state in `DescriptionForm.js`
2. Add the new UI elements
3. Include the new data in the API request payload
4. Update the backend API if needed

### Authentication Customization
To modify authentication behavior:
1. Update `src/context/AuthContext.js` for auth logic
2. Modify `src/components/auth/AuthModal.js` for UI changes
3. Update API endpoints in `src/config/api.js`

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check that the Flask backend is running on port 5000
   - Verify the `REACT_APP_API_URL` in your `.env` file
   - Check browser console for CORS-related errors

2. **API Connection Errors**
   - Ensure the Flask backend is running
   - Check the API URL configuration
   - Verify CORS configuration in the backend

3. **Token Issues**
   - Clear localStorage if tokens are corrupted
   - Check token expiration
   - Verify backend token validation

## Security Considerations

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- All API calls include proper error handling
- Sensitive data is not logged to console
- CORS is properly configured for security

## License

This project is licensed under the MIT License.
