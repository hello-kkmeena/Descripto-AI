# Descripto API Backend Quick Start Guide

## Prerequisites

- Java 17 or higher
- Maven 3.8.x or higher
- Git

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd springboot
   ```

2. Install dependencies:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   # Development mode
   mvn spring-boot:run -Dspring.profiles.active=dev

   # Production mode
   mvn spring-boot:run -Dspring.profiles.active=prod

   # Test mode
   mvn spring-boot:run -Dspring.profiles.active=test
   ```

## API Documentation

1. Access Swagger UI:
   ```
   http://localhost:8080/api/v1/swagger-ui.html
   ```

2. Available endpoints:
   - Authentication: `/auth/**`
   - Test: `/test/**`
   - Actuator: `/actuator/**`

3. Testing with Swagger UI:
   1. Open Swagger UI
   2. Use `/auth/login` endpoint to get token
   3. Click "Authorize" button
   4. Enter token as: `Bearer <your-token>`
   5. Test other endpoints

## Authentication

1. Default credentials:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

2. JWT token format:
   ```
   Authorization: Bearer <token>
   ```

## Development Guidelines

1. Code Structure:
   ```
   src/main/java/com/descripto/api/
   ├── config/         # Configuration classes
   ├── controller/     # REST controllers
   ├── dto/           # Data Transfer Objects
   ├── model/         # Domain models
   ├── repository/    # Data repositories
   ├── security/      # Security components
   ├── service/       # Business logic
   └── utils/         # Utility classes
   ```

2. Adding new endpoints:
   - Create DTO if needed
   - Create Controller
   - Add Service layer
   - Add Repository if needed
   - Add OpenAPI documentation
   - Add tests

3. Testing:
   ```bash
   # Run all tests
   mvn test

   # Run specific test
   mvn test -Dtest=TestClassName
   ```

## Common Tasks

1. Adding new dependency:
   ```xml
   <dependency>
       <groupId>group-id</groupId>
       <artifactId>artifact-id</artifactId>
       <version>version</version>
   </dependency>
   ```

2. Updating application properties:
   - Edit `application.properties`
   - Or environment-specific:
     - `application-dev.properties`
     - `application-prod.properties`
     - `application-test.properties`

3. Logging:
   ```java
   @Slf4j
   public class YourClass {
       public void yourMethod() {
           log.debug("Debug message");
           log.info("Info message");
           log.warn("Warning message");
           log.error("Error message");
       }
   }
   ```

## Troubleshooting

1. Port already in use:
   ```bash
   lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
   ```

2. Clean build:
   ```bash
   mvn clean install -U
   ```

3. Debug mode:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
   ```

## Monitoring

1. Health check:
   ```
   http://localhost:8080/api/v1/actuator/health
   ```

2. Metrics:
   ```
   http://localhost:8080/api/v1/actuator/metrics
   ```

## Security Best Practices

1. Never commit sensitive data:
   - Use environment variables
   - Use external configuration
   - Use secrets management

2. Always validate input:
   - Use DTOs with validation
   - Sanitize user input
   - Use proper content types

3. Keep dependencies updated:
   ```bash
   mvn versions:display-dependency-updates
   ```

## Additional Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security Documentation](https://docs.spring.io/spring-security/reference/)
- [OpenAPI Documentation](https://springdoc.org/)
- [JWT Documentation](https://jwt.io/) 