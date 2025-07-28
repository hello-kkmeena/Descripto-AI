# Docker Setup for Descripto-AI Spring Boot Application

This guide explains how to use Docker for both development and production environments of the Descripto-AI Spring Boot application.

## Quick Start

```bash
# Development mode with hot-reload
docker-compose up --build

# Production mode
docker build -t descripto-api .
docker run -p 8080:8080 descripto-api
```

## Development Environment

### Prerequisites
- Docker installed on your machine
- Docker Compose installed on your machine
- Java Development Kit (JDK) 17 (optional, for local development)
- Maven (optional, for local development)

### Development Setup

We use `docker-compose` with a special development Dockerfile (`Dockerfile.dev`) that enables hot-reloading and development tools.

1. **Start the Development Environment**:
   ```bash
   docker-compose up --build
   ```
   This command will:
   - Build the development container
   - Start the Spring Boot application
   - Enable hot-reloading
   - Mount your source code into the container
   - Expose debug port 5005

2. **Development Features**:
   - **Hot Reloading**: Changes to your Java files trigger automatic application restart
   - **Live Code Updates**: Source code is mounted from your local machine
   - **Maven Cache**: Uses your local Maven cache (`~/.m2`) for faster builds
   - **Debug Support**: Remote debugging available on port 5005
   - **Development Profile**: Uses the `application-dev.properties` configuration

3. **Making Changes**:
   - Edit source files in your IDE
   - Changes are detected automatically
   - Application restarts with new changes
   - No need to rebuild or restart containers

4. **Viewing Logs**:
   ```bash
   # Follow the logs
   docker-compose logs -f app
   
   # View last 100 lines
   docker-compose logs --tail=100 app
   ```

5. **Stopping the Development Environment**:
   ```bash
   docker-compose down
   ```

### Development Container Structure
- Uses Maven 3.9.5 with OpenJDK 17
- Spring Boot DevTools enabled
- Volume mounts for:
  - Source code: `./src:/app/src`
  - POM file: `./pom.xml:/app/pom.xml`
  - Maven cache: `~/.m2:/root/.m2`

## Production Environment

The production setup uses a multi-stage build process for optimal container size and security.

### Building for Production

1. **Build the Production Image**:
   ```bash
   docker build -t descripto-api .
   ```

2. **Run the Production Container**:
   ```bash
   docker run -p 8080:8080 descripto-api
   ```

### Production Features
- Multi-stage build for smaller image size
- Uses OpenJDK 17 slim base image
- Non-root user for security
- Health check endpoint configured
- Production-optimized JVM settings
- No development dependencies included

### Production Container Structure
- Base image: `openjdk:17-jre-slim`
- Non-root user: `appuser`
- Exposed port: 8080
- Health check configured
- Optimized for production use

## Environment Differences

| Feature                | Development          | Production          |
|-----------------------|----------------------|---------------------|
| Base Image            | maven:3.9.5-openjdk-17 | openjdk:17-jre-slim |
| Hot Reload            | Yes                  | No                 |
| Source Code           | Mounted              | Copied             |
| Debug Port           | Yes (5005)           | No                 |
| Build Time            | Faster               | Longer             |
| Container Size        | Larger               | Smaller            |
| User                  | root                 | appuser            |
| Spring Profile        | dev                  | prod               |

## Troubleshooting

1. **Container Won't Start**:
   - Check Docker logs: `docker-compose logs app`
   - Verify port availability: `lsof -i :8080`
   - Check disk space: `docker system df`

2. **Hot Reload Not Working**:
   - Ensure DevTools is in pom.xml
   - Verify file mounting in docker-compose.yml
   - Check application logs for reload triggers

3. **Build Failures**:
   - Clear Maven cache: `rm -rf ~/.m2/repository`
   - Rebuild with no cache: `docker-compose build --no-cache`
   - Check Maven dependencies in pom.xml

4. **Performance Issues**:
   - Monitor container stats: `docker stats`
   - Check container logs for memory issues
   - Verify resource limits in docker-compose.yml

## Common Commands

```bash
# Rebuild containers
docker-compose build --no-cache

# Start in detached mode
docker-compose up -d

# View container logs
docker-compose logs -f

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# Check container status
docker-compose ps

# Execute command in container
docker-compose exec app /bin/bash
```

## Security Notes

1. Development environment:
   - Runs as root (normal for development)
   - Debug port exposed (5005)
   - DevTools enabled

2. Production environment:
   - Runs as non-root user
   - No debug ports exposed
   - No development tools included
   - Health check enabled
   - Minimal base image

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Spring Boot Docker Guide](https://spring.io/guides/topicals/spring-boot-docker/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot DevTools](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.devtools) 