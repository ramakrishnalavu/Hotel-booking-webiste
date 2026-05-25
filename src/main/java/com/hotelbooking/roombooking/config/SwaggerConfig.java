package com.hotelbooking.roombooking.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    static {
        // Prevent Swagger from scanning Spring Security details, avoiding circular reference loops
        SpringDocUtils.getConfig().addRequestWrapperToIgnore(
                org.springframework.security.core.userdetails.UserDetails.class,
                org.springframework.security.core.annotation.AuthenticationPrincipal.class
        );
    }

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token in the format: Bearer <token>")
                        )
                )
                .info(new Info()
                        .title("Hotel Booking Management System API")
                        .version("1.0")
                        .description("Enterprise-grade REST APIs for Hotel Booking Management System supporting Users, Managers, and Admins roles.")
                        .contact(new Contact()
                                .name("DeepMind Developer")
                                .email("developer@hotelbooking.com")
                        )
                );
    }
}
