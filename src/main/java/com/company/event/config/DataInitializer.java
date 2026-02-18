package com.company.event.config;

import com.company.event.user.Roles;
import com.company.event.user.User;
import com.company.event.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default SUPER_ADMIN if not exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            User superAdmin = User.builder()
                    .username("admin")
                    .email("admin@eventhub.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Roles.SUPER_ADMIN)
                    .firstName("System")
                    .lastName("Administrator")
                    .createdAt(Instant.now())
                    .build();
            userRepository.save(superAdmin);
            System.out.println("✨ Super Admin created: admin / admin123");
        }

        // Create default STUDENT demo user if not exists
        if (userRepository.findByUsername("student").isEmpty()) {
            User student = User.builder()
                    .username("student")
                    .email("student@demo.com")
                    .password(passwordEncoder.encode("student123"))
                    .role(Roles.STUDENT)
                    .firstName("Demo")
                    .lastName("Student")
                    .college("Demo University")
                    .createdAt(Instant.now())
                    .build();
            userRepository.save(student);
            System.out.println("✨ Demo Student created: student / student123");
        }
    }
}
