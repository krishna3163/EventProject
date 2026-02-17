package com.company.event.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class UserController {

    private final UserRepository userRepository;

    @PostMapping("/sync")
    public ResponseEntity<?> syncUser(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject(); // 'sub' claim in Supabase JWT
        String email = jwt.getClaim("email");
        Map<String, Object> metadata = jwt.getClaim("user_metadata");

        log.info("Syncing user {} with email {}", userId, email);

        User user = userRepository.findById(userId).orElse(new User());
        user.setId(userId);
        user.setEmail(email);

        if (metadata != null) {
            user.setFirstName((String) metadata.getOrDefault("firstName", user.getFirstName()));
            user.setLastName((String) metadata.getOrDefault("lastName", user.getLastName()));
            user.setCourse((String) metadata.getOrDefault("course", user.getCourse()));
            user.setBranch((String) metadata.getOrDefault("branch", user.getBranch()));
            user.setFatherName((String) metadata.getOrDefault("fatherName", user.getFatherName()));

            // Handle role from metadata
            String roleStr = (String) metadata.getOrDefault("role", "USER");
            try {
                user.setRole(Roles.valueOf(roleStr.toUpperCase()));
            } catch (Exception e) {
                user.setRole(Roles.USER);
            }
        }

        // Generate username from email if not present
        if (user.getUsername() == null) {
            user.setUsername(email.split("@")[0]);
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User synced successfully", "userId", userId));
    }
}
