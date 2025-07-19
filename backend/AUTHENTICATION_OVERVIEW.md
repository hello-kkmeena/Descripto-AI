# Authentication System Overview

## Architecture Overview

The Descripto-AI backend implements a comprehensive authentication system using JWT (JSON Web Tokens) with optional Google OAuth integration. The system is designed for scalability, security, and ease of use.

## Technical Implementation

### 1. Core Authentication Flow

```
User Registration/Login → JWT Token Generation → Token Validation → Protected Routes
```

#### Registration Process:
1. **Input Validation**: Email, password, first name, last name validation
2. **Password Hashing**: Bcrypt-based password hashing with salt
3. **User Creation**: SQLAlchemy ORM for database operations
4. **JWT Generation**: Access and refresh token creation
5. **Response**: User data + tokens returned to client

#### Login Process:
1. **Credential Verification**: Email/password validation against database
2. **Password Verification**: Bcrypt password comparison
3. **JWT Generation**: New access and refresh tokens
4. **Response**: User data + tokens returned to client

### 2. JWT Token System

#### Token Types:
- **Access Token**: Short-lived (1 hour) for API access
- **Refresh Token**: Long-lived (7 days) for token renewal

#### Token Structure:
```json
{
  "sub": "user_id",
  "iat": "issued_at_timestamp",
  "exp": "expiration_timestamp",
  "type": "access|refresh"
}
```

#### Token Security:
- **Secret Key**: Environment-based JWT secret
- **Algorithm**: HS256 (HMAC SHA-256)
- **Expiration**: Automatic token expiration
- **Refresh Logic**: Automatic token renewal via refresh token

### 3. Database Schema

#### User Model:
```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### Token Blacklist (Optional):
```python
class TokenBlacklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
```

### 4. Security Features

#### Password Security:
- **Hashing**: Bcrypt with configurable rounds
- **Validation**: Minimum length, complexity requirements
- **Salt**: Automatic salt generation per password

#### Input Validation:
```python
# Email validation
email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

# Password requirements
MIN_PASSWORD_LENGTH = 8
REQUIRE_SPECIAL_CHAR = True
REQUIRE_NUMBER = True
REQUIRE_UPPERCASE = True
```

#### Rate Limiting:
- **Authentication Endpoints**: 5 requests per minute
- **General API**: 200 requests per day
- **Storage**: In-memory rate limiting

### 5. API Endpoints

#### Authentication Routes:
```
POST /auth/register     - User registration
POST /auth/login        - User login
POST /auth/refresh      - Token refresh
POST /auth/logout       - User logout
GET  /auth/profile      - Get user profile
PUT  /auth/profile      - Update user profile
```

#### Protected Routes:
```
POST /generate-description  - Generate AI descriptions
GET  /health               - Health check
```

### 6. Middleware Implementation

#### JWT Authentication Middleware:
```python
@jwt_required()
def protected_route():
    current_user = get_jwt_identity()
    return {"message": "Protected data"}
```

#### CORS Configuration:
```python
CORS_ORIGINS = [
    'http://localhost:3000',  # Development
    'https://your-domain.com' # Production
]
CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
CORS_ALLOW_HEADERS = ['Content-Type', 'Authorization']
```

### 7. Error Handling

#### Authentication Errors:
- **401 Unauthorized**: Invalid/missing token
- **403 Forbidden**: Insufficient permissions
- **422 Validation Error**: Invalid input data
- **429 Too Many Requests**: Rate limit exceeded

#### Error Response Format:
```json
{
  "error": "error_type",
  "message": "Human readable message",
  "details": "Additional error details"
}
```

### 8. Configuration Management

#### Environment Variables:
```bash
# JWT Configuration
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=604800

# Database
DATABASE_URL=sqlite:///app.db

# Security
SECRET_KEY=your-app-secret
MIN_PASSWORD_LENGTH=8
```

#### Configuration Classes:
- **DevelopmentConfig**: Permissive settings for development
- **ProductionConfig**: Restrictive settings for production
- **TestingConfig**: In-memory database for testing

### 9. Google OAuth Integration (Optional)

#### OAuth Flow:
1. **Frontend**: Redirects to Google OAuth
2. **Google**: Returns authorization code
3. **Backend**: Exchanges code for access token
4. **Backend**: Fetches user info from Google
5. **Backend**: Creates/updates local user
6. **Backend**: Returns JWT tokens

#### OAuth Configuration:
```python
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')
```

### 10. Logging and Monitoring

#### Authentication Logging:
- **Login Attempts**: Success/failure logging
- **Token Operations**: Token creation, validation, refresh
- **Security Events**: Rate limiting, suspicious activity
- **Error Tracking**: Authentication errors and stack traces

#### Log Format:
```python
api_logger.info("User login successful", 
               user_id=user.id, 
               email=user.email,
               ip_address=request.remote_addr)
```

### 11. Deployment Considerations

#### Production Security:
- **HTTPS Only**: All authentication over HTTPS
- **Secure Headers**: HSTS, CSP, X-Frame-Options
- **Environment Variables**: Secure secret management
- **Database Security**: Encrypted connections, proper permissions

#### Scalability:
- **Stateless Authentication**: JWT-based stateless auth
- **Database Optimization**: Indexed user queries
- **Caching**: Optional Redis for session management
- **Load Balancing**: Stateless design supports horizontal scaling

### 12. Testing Strategy

#### Unit Tests:
- **User Model**: CRUD operations, validation
- **Authentication**: Login, registration, token validation
- **Password Security**: Hashing, validation
- **Error Handling**: Invalid inputs, edge cases

#### Integration Tests:
- **API Endpoints**: Full request/response cycles
- **Database Operations**: Real database interactions
- **OAuth Flow**: Complete OAuth integration testing

#### Security Tests:
- **Token Security**: JWT validation, expiration
- **Password Security**: Brute force protection
- **Rate Limiting**: Request limiting effectiveness
- **Input Validation**: SQL injection, XSS prevention

## File Structure

```
backend/
├── models/
│   ├── __init__.py          # Database initialization
│   └── user.py              # User model definition
├── routes/
│   └── auth.py              # Authentication endpoints
├── utils/
│   └── auth_utils.py        # Authentication utilities
├── middleware/
│   ├── cors.py              # CORS configuration
│   └── error_handler.py     # Error handling
├── config/
│   └── __init__.py          # Configuration management
└── app.py                   # Main application
```

## Dependencies

```txt
Flask-JWT-Extended==4.5.3
Flask-SQLAlchemy==3.0.5
Flask-Limiter==3.5.0
Flask-CORS==4.0.0
bcrypt==4.0.1
python-dotenv==1.0.0
```

This authentication system provides a robust, secure, and scalable foundation for the Descripto-AI application, supporting both traditional email/password authentication and modern OAuth integration. 