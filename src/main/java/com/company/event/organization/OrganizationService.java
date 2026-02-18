package com.company.event.organization;

import com.company.event.user.Roles;
import com.company.event.user.User;
import com.company.event.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    public Optional<Organization> getById(String id) {
        return organizationRepository.findById(id);
    }

    public Optional<Organization> getByUsername(String username) {
        return organizationRepository.findByUsername(username);
    }

    public List<User> getStudentsByOrg(String orgId) {
        return userRepository.findByOrganizationId(orgId);
    }

    /**
     * Add an existing user as admin of an organization.
     * If user exists: promote to ORG_ADMIN and link to org.
     * If not: return invitation needed flag.
     */
    public Map<String, Object> addAdmin(String orgId, String orgUsername, String userEmail) {
        // Verify org exists
        Organization org = organizationRepository.findById(orgId)
                .or(() -> organizationRepository.findByUsername(orgUsername))
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        Optional<User> existingUser = userRepository.findByEmail(userEmail);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setRole(Roles.ORG_ADMIN);
            user.setOrganizationId(org.getId());
            userRepository.save(user);
            return Map.of(
                    "success", true,
                    "message", "User promoted to ORG_ADMIN",
                    "userId", user.getId());
        } else {
            // User doesn't exist - invitation needed
            return Map.of(
                    "success", false,
                    "invitationNeeded", true,
                    "message", "User not found. Invitation link would be sent to: " + userEmail);
        }
    }

    public List<User> getAdminsByOrg(String orgId) {
        return userRepository.findByOrganizationId(orgId).stream()
                .filter(u -> u.getRole() == Roles.ORG_ADMIN)
                .toList();
    }

    public Map<String, Object> toggleBlockUserInOrg(String orgId, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!orgId.equals(user.getOrganizationId())) {
            throw new RuntimeException("User does not belong to this organization");
        }

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        return Map.of(
                "success", true,
                "message", user.isEnabled() ? "User unblocked" : "User blocked",
                "enabled", user.isEnabled());
    }
}
