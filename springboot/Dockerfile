FROM eclipse-temurin:17-jdk-alpine

# Install Maven
RUN apk update && \
    apk add --no-cache maven

WORKDIR /app
COPY . .

# Build with Maven (you can use install instead of package)
RUN mvn clean install -DskipTests

# Use the final built JAR
CMD ["java", "-jar", "target/descripto-api-backend-1.0.0.jar", "--spring.profiles.active=dev"]