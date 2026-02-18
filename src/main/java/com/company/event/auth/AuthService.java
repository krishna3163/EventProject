package com.company.event.auth;

import com.company.event.organization.Organization;
import com.company.event.organization.OrganizationRepository;
import com.company.event.security.JwtService;
import com.company.event.user.Roles;
import com.company.event.user.User;
import com.company.event.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(AuthRequest request) {

        // God Mode: Direct access for quick testing/admin purposes
        if ("admin".equals(request.getUsernameOrEmail()) && "admin123".equals(request.getPassword())) {

            User adminUser = User.builder()
                    .id("super-admin-god-mode")
                    .username("admin")
                    .email("admin@event.com")
                    .password(passwordEncoder.encode("admin123")) // Dummy encoded password
                    .role(Roles.SUPER_ADMIN)
                    .firstName("Super")
                    .lastName("Admin")
                    .enabled(true)
                    .createdAt(Instant.now())
                    .build();

            String jwtToken = jwtService.generateToken(adminUser);

            return AuthResponse.builder()
                    .token(jwtToken)
                    .id(adminUser.getId())
                    .username(adminUser.getUsername())
                    .email(adminUser.getEmail())
                    .firstName(adminUser.getFirstName())
                    .lastName(adminUser.getLastName())
                    .role(adminUser.getRole().name())
                    .organizationId(null)
                    .build();
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()));

        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .organizationId(user.getOrganizationId())
                .build();
    }

    public AuthResponse registerStudent(StudentRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Generate username from name or email
        String username = request.getUsername() != null && !request.getUsername().isBlank()
                ? request.getUsername()
                : generateUsername(request.getName() != null ? request.getName() : request.getEmail());

        if (userRepository.existsByUsername(username)) {
            username = username + "_" + UUID.randomUUID().toString().substring(0, 4);
        }

        // Parse name
        String firstName = request.getFirstName();
        String lastName = request.getLastName();
        if ((firstName == null || firstName.isBlank()) && request.getName() != null) {
            String[] parts = request.getName().trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        User user = User.builder()
                .username(username)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Roles.STUDENT)
                .firstName(firstName)
                .lastName(lastName != null ? lastName : "")
                .college(request.getCollege())
                .phone(request.getPhone())
                .course(request.getCourse())
                .branch(request.getBranch())
                .firebaseUid(request.getFirebaseUid())
                .createdAt(Instant.now())
                .build();

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse registerOrganization(OrgRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (organizationRepository.existsByUsername(request.getOrganizationUsername())) {
            throw new IllegalArgumentException("Organization username already taken");
        }

        // Create admin user
        String adminName = request.getAdminName() != null ? request.getAdminName() : request.getOrganizationName();
        String[] parts = adminName.trim().split("\\s+", 2);

        User adminUser = User.builder()
                .username(request.getOrganizationUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Roles.ORG_ADMIN)
                .firstName(parts[0])
                .lastName(parts.length > 1 ? parts[1] : "")
                .phone(request.getContactNumber())
                .firebaseUid(request.getFirebaseUid())
                .createdAt(Instant.now())
                .build();

        userRepository.save(adminUser);

        // Create organization
        Organization org = Organization.builder()
                .name(request.getOrganizationName())
                .username(request.getOrganizationUsername())
                .email(request.getEmail())
                .contactNumber(request.getContactNumber())
                .createdBy(adminUser.getId())
                .createdAt(Instant.now())
                .build();

        organizationRepository.save(org);

        // Link user to org
        adminUser.setOrganizationId(org.getId());
        userRepository.save(adminUser);

        String jwtToken = jwtService.generateToken(adminUser);

        return AuthResponse.builder()
                .token(jwtToken)
                .id(adminUser.getId())
                .username(adminUser.getUsername())
                .email(adminUser.getEmail())
                .firstName(adminUser.getFirstName())
                .lastName(adminUser.getLastName())
                .role(adminUser.getRole().name())
                .organizationId(org.getId())
                .build();
    }

    private String generateUsername(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9]", "")
                .substring(0, Math.min(name.length(), 15));
    }
}
