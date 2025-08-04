package com.descripto.api.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI (Swagger) configuration for API documentation
 * 
 * @author krishna.meena
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Descripto API",
        version = "1.0.0",
        description = "Secure API Management Backend for Descripto-AI",
        contact = @Contact(
            name = "Descripto Team",
            email = "support@descripto.ai",
            url = "https://descripto.ai"
        )
    ),
    security = @SecurityRequirement(name = "Bearer Authentication"),
    servers = {
        @Server(
            url = "${server.servlet.context-path}",
            description = "Local Server"
        )
    }
)
@SecurityScheme(
    name = "Bearer Authentication",
    description = "JWT Authentication using Bearer token",
    scheme = "bearer",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {

    @Value("${server.servlet.context-path}")
    private String contextPath;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication",
                    new io.swagger.v3.oas.models.security.SecurityScheme()
                        .type(io.swagger.v3.oas.models.security.SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .in(io.swagger.v3.oas.models.security.SecurityScheme.In.HEADER)
                        .name("Authorization")
                        .description("JWT Authorization header using Bearer scheme")))
            .addSecurityItem(new io.swagger.v3.oas.models.security.SecurityRequirement().addList("Bearer Authentication"))
            .info(new io.swagger.v3.oas.models.info.Info()
                .title("Descripto API")
                .version("1.0.0")
                .description("Secure API Management Backend for Descripto-AI")
                .contact(new io.swagger.v3.oas.models.info.Contact()
                    .name("Descripto Team")
                    .email("support@descripto.ai")
                    .url("https://descripto.ai"))
                .license(new io.swagger.v3.oas.models.info.License()
                    .name("MIT License")
                    .url("https://opensource.org/licenses/MIT")));
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
            .group("all")
            .packagesToScan("com.descripto.api")
            .pathsToMatch("/**")
            .build();
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("public")
            .packagesToScan("com.descripto.api.controller")
            .pathsToMatch("/auth/**", "/test/**")
            .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
            .group("admin")
            .packagesToScan("com.descripto.api.controller")
            .pathsToMatch("/admin/**")
            .build();
    }

    @Bean
    public GroupedOpenApi actuatorApi() {
        return GroupedOpenApi.builder()
            .group("actuator")
            .packagesToScan("com.descripto.api")
            .pathsToMatch("/actuator/**")
            .build();
    }
} 