package com.company.event.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                return http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())

                                .authorizeHttpRequests(auth -> auth
                                                // Public endpoints
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers("/user/insert").permitAll()
                                                .requestMatchers("/actuator/**").permitAll()

                                                // Swagger / OpenAPI
                                                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                                                // Admin-only endpoints
                                                .requestMatchers("/api/events/createEvent").hasRole("ADMIN")
                                                .requestMatchers("/api/events/updateEvent/**").hasRole("ADMIN")
                                                .requestMatchers("/api/events/deleteEvent/**").hasRole("ADMIN")
                                                .requestMatchers("/api/questions/**").hasRole("ADMIN")
                                                .requestMatchers("/api/mcq/admin/**").hasRole("ADMIN")
                                                .requestMatchers("/contest/insert").hasRole("ADMIN")
                                                .requestMatchers("/contest/update/**").hasRole("ADMIN")
                                                .requestMatchers("/contest/delete/**").hasRole("ADMIN")
                                                .requestMatchers("/problem/insert").hasRole("ADMIN")
                                                .requestMatchers("/problem/update/**").hasRole("ADMIN")
                                                .requestMatchers("/problem/delete/**").hasRole("ADMIN")
                                                .requestMatchers("/user/delete/**").hasRole("ADMIN")

                                                // Everything else requires authentication
                                                .anyRequest().authenticated())

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                                .build();
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
                org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
                configuration.addAllowedOriginPattern("*");
                configuration.addAllowedMethod("*");
                configuration.addAllowedHeader("*");
                configuration.setAllowCredentials(true);
                org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
