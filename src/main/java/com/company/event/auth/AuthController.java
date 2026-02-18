package com.company.event.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register/student")
    public ResponseEntity<AuthResponse> registerStudent(@RequestBody StudentRegisterRequest request) {
        return ResponseEntity.ok(authService.registerStudent(request));
    }

    @PostMapping("/register/organization")
    public ResponseEntity<AuthResponse> registerOrganization(@RequestBody OrgRegisterRequest request) {
        return ResponseEntity.ok(authService.registerOrganization(request));
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> sync() {
        // Endpoint for frontend to sync after Supabase login (legacy support)
        return ResponseEntity.ok(Map.of("status", "synced"));
    }

    // Legacy sync endpoint
    @PostMapping("/users/sync")
    public ResponseEntity<Map<String, String>> legacySync() {
        return ResponseEntity.ok(Map.of("status", "synced"));
    }
}
