package com.company.event.security;

import com.company.event.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final com.company.event.user.UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        // TEMPORARY: Hardcoded admin fallback for backend
        if ("admin".equals(username)) {
            return com.company.event.user.User.builder()
                    .username("admin")
                    // BCrypt hash for "admin"
                    .password("$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.S.SR7G")
                    .role(com.company.event.user.Roles.ADMIN)
                    .firstName("System")
                    .lastName("Admin")
                    .build();
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
