package com.company.event.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;
        private final UserDetailsService userDetailsService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                return http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                // Public auth endpoints
                                                .requestMatchers("/api/auth/**").permitAll()
                                                // Legacy public endpoints
                                                .requestMatchers("/user/insert/**").permitAll()
                                                .requestMatchers("/api/events/getAllEvent").permitAll()
                                                .requestMatchers("/api/events/getEventById/**").permitAll()
                                                .requestMatchers("/contest/getAll/**").permitAll()
                                                .requestMatchers("/contest/getById/**").permitAll()
                                                .requestMatchers("/leaderboard/**").permitAll()
                                                .requestMatchers("/problem/getAll/**").permitAll()
                                                .requestMatchers("/problem/getById/**").permitAll()
                                                .requestMatchers("/api/mcq/start/**").permitAll()
                                                .requestMatchers("/api/mcq/submit/**").permitAll()
                                                .requestMatchers("/api/mcq/remaining-time/**").permitAll()
                                                .requestMatchers("/api/registrations/**").permitAll()
                                                .requestMatchers("/submission/**").permitAll()
                                                // WebSocket
                                                .requestMatchers("/ws/**").permitAll()
                                                // Swagger/OpenAPI
                                                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                                                // Public Organization Endpoints
                                                .requestMatchers("/api/public/**").permitAll()
                                                .requestMatchers("/", "/error").permitAll()
                                                // Student routes
                                                .requestMatchers("/api/student/**")
                                                .hasAnyRole("STUDENT", "USER", "ORG_ADMIN", "SUPER_ADMIN", "ADMIN")
                                                // Admin routes (ORG_ADMIN or SUPER_ADMIN)
                                                .requestMatchers("/api/admin/**")
                                                .hasAnyRole("ORG_ADMIN", "SUPER_ADMIN", "ADMIN")
                                                // Super admin functionality (SUPER_ADMIN and legacy ADMIN)
                                                .requestMatchers("/api/super/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                                                // Legacy admin routes
                                                .requestMatchers("/api/events/createEvent/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/api/events/updateEvent/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/api/events/deleteEvent/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/api/mcq/admin/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/api/questions/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/contest/insert/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/contest/update/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/contest/delete/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/problem/insert/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/problem/update/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/problem/delete/**")
                                                .hasAnyRole("ADMIN", "ORG_ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/user/getAll/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider())
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(List.of("*"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                return authProvider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
