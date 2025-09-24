# Descripto-AI Backend System Overview

## 🏗️ **System Architecture Overview**

### **Core Technology Stack**
- **Framework**: Spring Boot 3.2.0 (Java 17)
- **Security**: Spring Security 6.2.0 with JWT authentication
- **Database**: Microsoft SQL Server with JPA/Hibernate
- **API Documentation**: OpenAPI 3.0 (Swagger)
- **Build Tool**: Maven with multi-profile support

### **Key Features & Capabilities**

#### 🔐 **Authentication & Security**
- **JWT-based authentication** with access and refresh tokens
- **Secure HTTP-only cookies** for token storage
- **Role-based access control** (RBAC) with user roles
- **CORS configuration** for frontend integration
- **Password encryption** using Spring Security's password encoder

#### 🤖 **AI-Powered Content Generation**
- **Gemini LLM Integration**: Uses Google's Gemini 2.0 Flash Lite model
- **E-commerce Product Descriptions**: Generates SEO-friendly product descriptions
- **Multi-tone Support**: Supports different writing tones (professional, casual, etc.)
- **Character Count Control**: Configurable output length limits

#### 📊 **Excel Processing & Data Management**
- **Dual Processing Modes**: Structured and unstructured Excel file processing
- **Column Structure Detection**: Automatic data type inference (String, Number, Boolean)
- **File Validation**: Size limits (25MB), row limits (1000), format validation
- **Data Type Inference**: Intelligent detection from sample data analysis
- **JSON Column Parsing**: Automatic conversion of JSON column definitions to ColumnStructure objects

#### 💾 **Data Management**
- **User Management**: Complete user lifecycle with email/mobile verification
- **Chat System**: Tab-based conversation management
- **Message History**: Persistent storage of user interactions
- **Content Caching**: Efficient content generation and retrieval

## 📡 **API Endpoints Structure**

### **Authentication (`/auth`)**
- `POST /login` - User authentication
- `POST /register` - User registration
- `POST /refresh` - Token refresh
- `POST /logout` - User logout

### **Content Generation (`/generate`)**
- `POST /description` - Generate product descriptions
- `POST /agent` - AI agent interactions
- `GET /chat/messages/{tabId}` - Retrieve chat history
- `GET /chat/tabs` - Get user's conversation tabs

### **User Management (`/users`)**
- `GET /profile` - User profile information
- `PUT /profile` - Update user profile
- `POST /verify-email` - Email verification

### **Excel Processing (`/excel`)**
- `POST /process` - Process Excel files (structured/unstructured mode)
- `GET /health` - Excel service health check

## 🗄️ **Database Schema**

### **Core Entities**
- **User**: Authentication, profile, roles, verification status
- **Message**: Chat messages with tone, title, features
- **Tab**: Conversation tabs for organizing chats
- **BaseEntity**: Common fields (ID, timestamps, audit info)

### **Relationships**
- Users have multiple tabs
- Tabs contain multiple messages
- Messages reference users and tabs

## 🔒 **Security Implementation**

### **JWT Configuration**
- **Access Token**: 24-hour validity
- **Refresh Token**: 7-day validity
- **Secure cookie storage** with HTTP-only flags
- **CORS protection** with configurable origins

### **Method-Level Security**
- `@PreAuthorize` annotations for role-based access
- **Custom authentication provider** with user details service
- **Exception handling** for security violations

## 🤖 **AI Integration Architecture**

### **LLM Gateway Pattern**
- **Interface-based design** (`LLMInterface`)
- **Gemini LLM implementation** with WebClient
- **Error handling** and fallback mechanisms
- **Prompt engineering** for structured content generation

### **Content Generation Flow**
1. User input validation
2. Prompt construction with parameters
3. LLM API call to Gemini
4. Response processing and formatting
5. Database persistence

## 🚀 **Development & Deployment**

### **Environment Profiles**
- **Development**: Hot reload, debug ports, dev tools
- **Production**: Optimized settings, security hardening
- **Testing**: Test containers, isolated database

### **Docker Support**
- **Multi-stage Dockerfile** for production builds
- **Development container** with volume mounting
- **Maven cache persistence** for faster builds

### **Monitoring & Observability**
- **Actuator endpoints** for health checks
- **Prometheus metrics** integration
- **Structured logging** with SLF4J
- **Request ID tracking** for debugging

## 📝 **Code Quality & Standards**

### **Best Practices**
- **Lombok** for reducing boilerplate code
- **MapStruct** for object mapping
- **Validation annotations** for input validation
- **Comprehensive exception handling**
- **Unit testing** with TestContainers

### **API Design**
- **RESTful principles** with proper HTTP methods
- **Consistent response format** using `ApiResponse<T>`
- **OpenAPI documentation** with detailed schemas
- **Error handling** with proper HTTP status codes

## ✅ **System Strengths**
- **Modern Spring Boot 3.x architecture**
- **Comprehensive security implementation**
- **AI integration with major LLM provider**
- **Scalable database design**
- **Professional API documentation**
- **Multi-environment deployment support**

## 🔧 **Areas for Enhancement**
- **Database connection pooling optimization**
- **LLM response caching strategy**
- **Rate limiting implementation**
- **Comprehensive test coverage**
- **Performance monitoring and alerting**

---

## 📁 **Project Structure**

```
springboot/
├── src/main/java/com/descripto/api/
│   ├── config/           # Configuration classes
│   ├── controller/       # REST API controllers
│   ├── dto/             # Data Transfer Objects
│   ├── exception/       # Custom exception classes
│   ├── interfaces/      # Service interfaces
│   ├── model/           # JPA entities
│   ├── pojo/            # Plain Old Java Objects
│   ├── repository/      # Data access layer
│   ├── scheduler/       # Scheduled tasks
│   ├── security/        # Security configuration
│   └── service/         # Business logic services
├── src/main/resources/  # Configuration files
├── src/test/            # Test classes
├── docker-compose.yml   # Development environment
├── Dockerfile           # Production build
├── Dockerfile.dev       # Development build
└── pom.xml             # Maven dependencies
```

## 🎯 **Key Dependencies**

### **Spring Boot Starters**
- `spring-boot-starter-web` - Web application support
- `spring-boot-starter-security` - Security framework
- `spring-boot-starter-data-jpa` - Database access
- `spring-boot-starter-validation` - Input validation
- `spring-boot-starter-actuator` - Monitoring endpoints

### **External Libraries**
- **JWT**: `jjwt-api`, `jjwt-impl`, `jjwt-jackson`
- **LLM Integration**: `msal4j` for Azure authentication
- **Database**: `mssql-jdbc` for SQL Server
- **Utilities**: `lombok`, `mapstruct`
- **Documentation**: `springdoc-openapi`

---

*This backend represents a **production-ready, enterprise-grade system** designed for AI-powered content generation with robust security, scalability, and maintainability features.*

**Generated on**: $(date)
**Version**: 1.0.0
**Author**: Descripto Team
