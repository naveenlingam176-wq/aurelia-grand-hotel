package com.aureliagrand.hotel.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI aureliaGrandOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Aurelia Grand Luxury & Resorts API")
                        .description("Hotel Management System REST API for Aurelia Grand Luxury & Resorts. "
                                + "Provides complete management endpoints for authentication, guest profiles, "
                                + "rooms, luxury suites, party & banquet halls, reservations, guest favorites, "
                                + "operational unified search, executive analytics, dining venues, online ordering, "
                                + "payments, and guest invoices.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Aurelia Grand Engineering Team")
                                .email("dev@aureliagrand.com")
                                .url("https://aureliagrand.com"))
                        .license(new License()
                                .name("Proprietary - Aurelia Grand Luxury & Resorts")
                                .url("https://aureliagrand.com/terms")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT Bearer authentication. Enter token in the format: `Bearer <JWT_TOKEN>` or `<JWT_TOKEN>`.")));
    }
}
