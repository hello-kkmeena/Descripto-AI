# Authentication System Guide
## Descripto-AI Backend

This guide explains the authentication system implementation in the Descripto-AI backend, including setup, configuration, and usage.

---

## Table of Contents
1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Configuration](#configuration)
4. [API Endpoints](#api-endpoints)
5. [Authentication Flow](#authentication-flow)
6. [Security Features](#security-features)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The authentication system provides:
- **Email/Password Authentication**: Traditional registration and login
- **Google OAuth**: One-click login with Google accounts
- **JWT Token Management**: Secure, stateless authentication
- **Password Security**: bcrypt hashing with configurable strength requirements
- **Rate Limiting**: Protection against brute force attacks
- **Flexible Database**: SQLite for development, PostgreSQL for production

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Initialize Database

```bash
# Create database tables
python scripts/create_tables.py
```

### 4. Start the Server

```bash
python app.py
```

---

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `FLASK_ENV` | Flask environment | `development` | No |
| `SECRET_KEY` | Flask secret key | Auto-generated | Yes |
| `DATABASE_URL` | Database connection | `sqlite:///app.db` | No |
| `JWT_SECRET_KEY` | JWT signing key | Auto-generated | Yes |
| `JWT_ACCESS_TOKEN_EXPIRES` | Access token expiry (seconds) | `3600` | No |
| `JWT_REFRESH_TOKEN_EXPIRES` | Refresh token expiry (seconds) | `604800` | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | None | For OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | None | For OAuth |
| `MIN_PASSWORD_LENGTH` | Minimum password length | `8` | No |
| `REQUIRE_SPECIAL_CHAR` | Require special characters | `true` | No |
| `REQUIRE_NUMBER` | Require numbers | `true` | No |
| `REQUIRE_UPPERCASE` | Require uppercase letters | `true` | No |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:3000`
6. Add redirect URIs: `http://localhost:3000/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

---

## API Endpoints

### Authentication Endpoints

#### POST `/auth/register`
Register a new user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_verified": false,
    "created_at": "2024-01-01T00:00:00",
    "has_google_account": false,
    "has_password": true
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** Same as register response.

#### POST `/auth/google`
Login with Google OAuth.

**Request Body:**
```json
{
  "id_token": "google_id_token_from_frontend"
}
```

**Response:** Same as register response.

#### POST `/auth/refresh`
Refresh access token.

**Request Body:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "access_token": "new_access_token",
  "user": {...}
}
```

#### GET `/auth/me`
Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_verified": false,
    "created_at": "2024-01-01T00:00:00",
    "last_login": "2024-01-01T12:00:00",
    "has_google_account": false,
    "has_password": true
  }
}
```

#### PUT `/auth/profile`
Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {...}
}
```

#### POST `/auth/change-password`
Change user password.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword456!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

#### POST `/auth/logout`
Logout user (client-side token invalidation).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Authentication Flow

### Email/Password Flow
1. User registers with email and password
2. Password is hashed with bcrypt
3. User receives access and refresh tokens
4. Access token used for API requests
5. Refresh token used to get new access token

### Google OAuth Flow
1. User clicks Google login button
2. Frontend gets Google ID token
3. Frontend sends ID token to `/auth/google`
4. Backend verifies token with Google
5. User is created or linked to existing account
6. User receives access and refresh tokens

### Token Management
- **Access Token**: Short-lived (1 hour), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens
- **Stateless**: No server-side session storage
- **Secure**: Signed with JWT secret key

---

## Security Features

### Password Security
- bcrypt hashing with salt
- Configurable strength requirements
- Minimum length, special characters, numbers, uppercase

### Rate Limiting
- Registration: 5 attempts per minute
- Login: 10 attempts per minute
- Google OAuth: 10 attempts per minute
- Token refresh: 20 attempts per minute
- Profile updates: 10 attempts per minute
- Password changes: 5 attempts per minute

### Input Validation
- Email format validation
- Password strength validation
- Request schema validation with Marshmallow
- SQL injection protection with SQLAlchemy

### CORS Configuration
- Configurable allowed origins
- Secure headers
- Preflight request handling

---

## Testing

### Manual Testing

1. **Test Registration:**
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

2. **Test Login:**
```bash
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

3. **Test Protected Endpoint:**
```bash
curl -X GET http://localhost:5001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Automated Testing

Create test files in `tests/` directory:

```python
# tests/test_auth.py
import pytest
from app import create_app
from models import db

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

def test_register_user(app):
    client = app.test_client()
    response = client.post('/auth/register', json={
        'email': 'test@example.com',
        'password': 'TestPassword123!'
    })
    assert response.status_code == 201
```

---

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check `DATABASE_URL` in `.env`
   - Ensure database file is writable
   - Run `python scripts/create_tables.py`

2. **JWT Token Errors**
   - Check `JWT_SECRET_KEY` in `.env`
   - Ensure token format: `Bearer <token>`
   - Check token expiration

3. **Google OAuth Errors**
   - Verify Google credentials in `.env`
   - Check authorized origins and redirect URIs
   - Ensure Google+ API is enabled

4. **CORS Errors**
   - Check `CORS_ORIGINS` configuration
   - Verify frontend origin is allowed
   - Check preflight request handling

5. **Rate Limiting**
   - Check rate limit configuration
   - Wait for rate limit to reset
   - Adjust limits in configuration

### Debug Mode

Enable debug mode for detailed error messages:

```bash
export FLASK_ENV=development
export DEBUG=True
python app.py
```

### Logs

Check application logs for detailed error information:

```bash
tail -f logs/app.log
```

---

## Production Considerations

1. **Security**
   - Change all default secrets
   - Use HTTPS in production
   - Implement token blacklisting
   - Add request logging

2. **Database**
   - Use PostgreSQL for production
   - Set up database backups
   - Configure connection pooling

3. **Monitoring**
   - Set up application monitoring
   - Monitor authentication failures
   - Track user metrics

4. **Scaling**
   - Use Redis for rate limiting
   - Implement load balancing
   - Consider microservices architecture

---

*This authentication system provides a solid foundation for secure user management in the Descripto-AI application.* 