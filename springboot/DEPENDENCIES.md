# Descripto API Backend Dependencies and Services

## Core Dependencies

### Spring Boot Starters

1. **spring-boot-starter-web**
   - Responsibility: Core web application support
   - Features:
     - Embedded Tomcat server
     - Spring MVC
     - RESTful application support
     - Auto-configuration

2. **spring-boot-starter-security**
   - Responsibility: Security framework integration
   - Features:
     - Authentication and authorization
     - Security filters
     - Password encoding
     - CSRF protection

3. **spring-boot-starter-actuator**
   - Responsibility: Application monitoring and management
   - Features:
     - Health checks
     - Metrics
     - Environment information
     - Application info

### Security and Authentication

1. **jjwt-api**, **jjwt-impl**, **jjwt-jackson**
   - Responsibility: JWT (JSON Web Token) handling
   - Features:
     - Token generation
     - Token validation
     - Token parsing
     - Claims management

### API Documentation

1. **springdoc-openapi-starter-webmvc-ui**
   - Responsibility: Swagger UI integration
   - Features:
     - Interactive API documentation
     - API testing interface
     - OpenAPI 3.0 support
     - Automatic API documentation

2. **springdoc-openapi-starter-webmvc-api**
   - Responsibility: OpenAPI specification generation
   - Features:
     - API metadata generation
     - Schema generation
     - Documentation annotations
     - OpenAPI configuration

### Development Tools

1. **spring-boot-devtools**
   - Responsibility: Development productivity
   - Features:
     - Automatic restart
     - Live reload
     - Property defaults
     - Development-time configuration

### Utility Libraries

1. **lombok**
   - Responsibility: Boilerplate code reduction
   - Features:
     - Automatic getters/setters
     - Builder pattern
     - Constructor generation
     - Logging support

2. **jackson-datatype-jsr310**
   - Responsibility: Java 8 date/time support
   - Features:
     - DateTime serialization
     - DateTime deserialization
     - ISO-8601 format support

## Services and Components

### Security Services

1. **JwtService**
   - Responsibility: JWT token management
   - Features:
     - Token generation
     - Token validation
     - Claims extraction
     - Token refresh

2. **AuthService**
   - Responsibility: Authentication handling
   - Features:
     - User authentication
     - Login processing
     - Token generation
     - Session management

3. **CustomUserDetailsService**
   - Responsibility: User details management
   - Features:
     - User loading
     - Role management
     - Authentication data

### Configuration Components

1. **SecurityConfig**
   - Responsibility: Security configuration
   - Features:
     - Security filters
     - Authentication manager
     - Password encoder
     - CORS configuration

2. **OpenApiConfig**
   - Responsibility: API documentation configuration
   - Features:
     - Swagger UI setup
     - API grouping
     - Security schemes
     - Server configuration

### Filters

1. **JwtAuthenticationFilter**
   - Responsibility: JWT-based authentication
   - Features:
     - Token extraction
     - Token validation
     - Authentication context
     - Request filtering

### Controllers

1. **AuthController**
   - Responsibility: Authentication endpoints
   - Features:
     - Login endpoint
     - Token generation
     - Response handling
     - Error handling

### Repositories

1. **UserRepository**
   - Responsibility: User data management
   - Features:
     - User CRUD operations
     - User queries
     - Data persistence
     - In-memory storage

### DTOs (Data Transfer Objects)

1. **LoginRequest**
   - Purpose: Login data transfer
   - Fields:
     - username
     - password

2. **LoginResponse**
   - Purpose: Authentication response
   - Fields:
     - accessToken
     - refreshToken
     - user details

3. **ApiResponse**
   - Purpose: Standardized API response
   - Fields:
     - success status
     - message
     - data
     - error details

## Environment-Specific Configurations

### Development Environment
- Active profile: dev
- Features:
  - Debug logging
  - Swagger UI enabled
  - Development JWT secret
  - In-memory storage

### Production Environment
- Active profile: prod
- Features:
  - Production logging
  - Enhanced security
  - Environment variables
  - Rate limiting

### Test Environment
- Active profile: test
- Features:
  - Test configuration
  - Minimal logging
  - Test JWT secret
  - Test data setup

## How to Add New Dependencies

1. Add the dependency to `pom.xml`
2. Run `mvn clean install` to download and install
3. Update relevant configuration in `application.properties`
4. Create necessary configuration classes
5. Document the dependency in this file

## Version Management

Current versions of major dependencies:
- Spring Boot: 3.2.0
- Java: 17
- SpringDoc OpenAPI: 2.3.0
- JJWT: 0.11.5
- Lombok: Latest version from Spring Boot parent

## Security Notes

1. JWT Configuration:
   - Secret key length: 512 bits
   - Token expiration: 24 hours
   - Refresh token: 7 days

2. Password Encoding:
   - Using BCrypt
   - Strength: 10 rounds

3. Authentication:
   - Bearer token based
   - Stateless sessions
   - Role-based access control

## Monitoring and Management

1. Actuator Endpoints:
   - /health
   - /info
   - /metrics
   - /prometheus

2. Logging:
   - Logback implementation
   - UTC timestamps
   - JSON format in production
   - Rolling file policy 