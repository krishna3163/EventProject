package com.company.event.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.Customizer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/user/insert/**").permitAll()
                        .requestMatchers("/user/getById/**").permitAll()
                        .requestMatchers("/user/delete/**").permitAll()
                        .requestMatchers("/user/update/**").permitAll()
                        .requestMatchers("/user/getAll/**").hasRole("ADMIN")
                        .requestMatchers("/contest/getById/**").permitAll()
                        .requestMatchers("/contest/update/**").hasRole("ADMIN")
                        .requestMatchers("/contest/getAll/**").permitAll()
                        .requestMatchers("/contest/delete/**").hasRole("ADMIN")
                        .requestMatchers("/contest/insert/**").hasRole("ADMIN")
                        .requestMatchers("/leaderboard/**").permitAll()
                        .requestMatchers("/submission/**").permitAll()
                        .requestMatchers("/problem/getById/**").permitAll()
                        .requestMatchers("/problem/getAll/**").permitAll()
                        .requestMatchers("/problem/delete/**").hasRole("ADMIN")
                        .requestMatchers("/problem/update/**").hasRole("ADMIN")
                        .requestMatchers("/problem/insert/**").hasRole("ADMIN")
                        .requestMatchers("/api/events/createEvent/**").hasRole("ADMIN")
                        .requestMatchers("/api/events/getEventById").permitAll()
                        .requestMatchers("/api/events/getAllEvent").permitAll()
                        .requestMatchers("/api/registrations/**").permitAll()
                        .requestMatchers("/api/mcq/admin/analytics/**").hasRole("ADMIN")
                        .requestMatchers("/api/mcq/admin/analytics/pdf/**").hasRole("ADMIN")
                        .requestMatchers("/api/mcq/start/**").permitAll()
                        .requestMatchers("/api/mcq/submit/**").permitAll()
                        .requestMatchers("/api/mcq/remaining-time/**").permitAll()
                        .requestMatchers("/api/questions/addQues/**").hasRole("ADMIN")
                        .requestMatchers("/api/questions/addQues/bulk/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )

                .httpBasic(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .build();
    }
}
