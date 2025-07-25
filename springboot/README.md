# Descripto API Backend

A secure, modular, and robust Spring Boot application for API management following industry best practices.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Comprehensive Security**: CORS, CSRF protection, security headers
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **In-Memory Storage**: List-based data storage without database dependencies
- **Monitoring**: Actuator endpoints with Prometheus metrics
- **Exception Handling**: Global exception handler with consistent error responses
- **Validation**: Request validation with detailed error messages
- **Testing**: Comprehensive test suite with TestContainers
- **Caching**: Redis/Caffeine caching support
- **Logging**: Structured logging with SLF4J

## 🛠️ Technology Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security 6.2.0**
- **In-Memory Data Storage**
- **JWT** (JSON Web Tokens)
- **OpenAPI 3.0** (Swagger)
- **Lombok**
- **MapStruct**
- **TestContainers**
- **Maven**

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- Docker (for TestContainers)


## 🏗️ Project Structure

```
src/
├── main/
│   ├── java/com/descripto/api/
│   │   ├── config/           # Configuration classes
│   │   ├── controller/       # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── exception/       # Custom exceptions
│   │   ├── security/        # Security components
│   │   ├── service/         # Business logic services
│   │   └── DescriptoApiApplication.java
│   └── resources/
│       └── application.yml  # Application configuration
└── test/
    └── java/com/descripto/api/
        ├── controller/      # Controller tests
        └── DescriptoApiApplicationTests.java
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to the springboot directory
cd springboot

# Build the project
mvn clean install
```

### 2. Run the Application

```bash
# Development mode
mvn spring-boot:run

# Or with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Access the Application

- **API Base URL**: http://localhost:8080/api/v1
- **Test Endpoint**: http://localhost:8080/api/v1/test
- **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html
- **Actuator Health**: http://localhost:8080/api/v1/actuator/health

## 🔧 Configuration

### Environment Profiles

The application supports multiple profiles:

- **dev**: Development environment with H2 database
- **prod**: Production environment with PostgreSQL
- **test**: Testing environment with in-memory database

### Environment Variables

For production deployment, set these environment variables:

```bash
# JWT
JWT_SECRET=your-256-bit-secret-key-here

# CORS
CORS_ORIGINS=https://descripto.ai,https://app.descripto.ai
```

## 🔒 Security

### Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Token Format**: `Bearer <jwt-token>`
2. **Token Expiration**: 24 hours (configurable)
3. **Refresh Token**: 7 days (configurable)

### Security Features

- JWT-based stateless authentication
- Password encryption with BCrypt
- CORS configuration
- Security headers (HSTS, CSP)
- Method-level security
- Rate limiting (configurable)

## 📚 API Documentation

### Test Endpoint

```http
GET /api/v1/test
```

**Response:**
```json
{
  "success": true,
  "message": "Test endpoint accessed successfully",
  "data": {
    "message": "Descripto API Backend is running successfully!",
    "timestamp": "2024-01-15T10:30:00",
    "status": "healthy",
    "version": "1.0.0",
    "environment": "development"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Authentication Endpoints

```http
POST /api/v1/auth/login
```

**Login Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "username": "admin",
    "email": "admin@descripto.ai",
    "roles": ["ROLE_ADMIN", "ROLE_USER"]
  }
}
```

### User Management Endpoints

```http
GET /api/v1/users          # Get all users (Admin only)
GET /api/v1/users/count    # Get user count
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
mvn test

# Run with specific profile
mvn test -Dspring.profiles.active=test

# Run integration tests
mvn verify
```

### Test Coverage

The project includes:
- Unit tests for services
- Integration tests for controllers
- Security tests
- Database tests with TestContainers

## 📊 Monitoring

### Actuator Endpoints

- `/actuator/health` - Application health
- `/actuator/info` - Application information
- `/actuator/metrics` - Application metrics
- `/actuator/prometheus` - Prometheus metrics

### Logging

The application uses structured logging with different levels:
- **DEBUG**: Detailed debugging information
- **INFO**: General application information
- **WARN**: Warning messages
- **ERROR**: Error messages

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t descripto-api-backend .

# Run container
docker run -p 8080:8080 descripto-api-backend
```

### Production Deployment

1. Set production profile: `spring.profiles.active=prod`
2. Configure database connection
3. Set secure JWT secret
4. Configure CORS origins
5. Set up monitoring and logging

## 🔧 Development

### Adding New Endpoints

1. Create controller in `controller` package
2. Add proper annotations (`@RestController`, `@RequestMapping`)
3. Add OpenAPI documentation
4. Write tests
5. Update security configuration if needed

### Data Model Changes

1. Create model in `model` package
2. Create repository class with in-memory storage
3. Add service layer
4. Update tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@descripto.ai
- Documentation: https://docs.descripto.ai
- Issues: GitHub Issues

---

**Built with ❤️ by the Descripto Team** 