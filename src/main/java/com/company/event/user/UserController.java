package com.company.event.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ─── Legacy endpoints ────────────────────────────────────────────────────

    @PostMapping("/user/insert")
    public ResponseEntity<?> insertUser(@Valid @RequestBody UserRequest userRequest) {
        User user = userService.insertUser(userRequest);
        if (user == null) {
            return new ResponseEntity<>("User not created", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>("User Created", HttpStatus.OK);
    }

    @GetMapping("/user/getById/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        UserResponse userResponse = userService.getUserById(id);
        if (userResponse == null) {
            return new ResponseEntity<>("User not found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @GetMapping("/user/getAll")
    public ResponseEntity<?> getAllUsers() {
        return new ResponseEntity<>(userService.getAllUsers(), HttpStatus.OK);
    }

    @DeleteMapping("/user/delete/{id}")
    public ResponseEntity<?> deleteUserById(@PathVariable String id) {
        boolean result = userService.deleteUserById(id);
        if (result) {
            return new ResponseEntity<>("User deleted", HttpStatus.OK);
        }
        return new ResponseEntity<>("User not found", HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/user/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id,
            @Valid @RequestBody UserRequest userRequest) {
        UserResponse userResponse = userService.updateUser(userRequest, id);
        if (userResponse == null) {
            return new ResponseEntity<>("User not found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    // ─── New API endpoints ───────────────────────────────────────────────────

    /** Get current authenticated user's profile */
    @GetMapping("/api/users/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getUserById(user.getId()));
    }

    /** Legacy Supabase sync endpoint – just returns OK */
    @PostMapping("/api/users/sync")
    public ResponseEntity<Map<String, String>> syncUser() {
        return ResponseEntity.ok(Map.of("status", "synced"));
    }

    /** Student-facing: get own profile */
    @GetMapping("/api/student/profile")
    public ResponseEntity<?> getStudentProfile(Authentication authentication) {
        if (authentication == null)
            return ResponseEntity.status(401).build();
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getUserById(user.getId()));
    }
}
