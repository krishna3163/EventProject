package com.company.event.superadmin;

import com.company.event.organization.Organization;
import com.company.event.organization.OrganizationRepository;
import com.company.event.user.Roles;
import com.company.event.user.User;
import com.company.event.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super")
@RequiredArgsConstructor
public class SuperAdminController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/organizations")
    public ResponseEntity<List<Organization>> getAllOrgs() {
        return ResponseEntity.ok(organizationRepository.findAll());
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        long totalUsers = userRepository.count();
        long totalOrgs = organizationRepository.count();
        long students = userRepository.findByRole(Roles.STUDENT).size()
                + userRepository.findByRole(Roles.USER).size();
        long admins = userRepository.findByRole(Roles.ORG_ADMIN).size();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalOrganizations", totalOrgs,
                "totalStudents", students,
                "totalAdmins", admins));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newRole = body.get("role");
        try {
            user.setRole(Roles.valueOf(newRole));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Role updated to " + newRole));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + newRole));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String userId) {
        if (!userRepository.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @PutMapping("/users/{userId}/toggle-block")
    public ResponseEntity<Map<String, Object>> toggleBlockUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", user.isEnabled() ? "User unblocked" : "User blocked",
                "enabled", user.isEnabled()));
    }
}
