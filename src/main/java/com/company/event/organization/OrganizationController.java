package com.company.event.organization;

import com.company.event.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/org")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/all")
    public ResponseEntity<List<Organization>> getAllOrgs() {
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }

    @GetMapping("/{orgId}")
    public ResponseEntity<Organization> getOrgById(@PathVariable String orgId) {
        return organizationService.getById(orgId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{orgId}/students")
    public ResponseEntity<List<User>> getStudents(@PathVariable String orgId) {
        return ResponseEntity.ok(organizationService.getStudentsByOrg(orgId));
    }

    @GetMapping("/{orgId}/admins")
    public ResponseEntity<List<User>> getAdmins(@PathVariable String orgId) {
        return ResponseEntity.ok(organizationService.getAdminsByOrg(orgId));
    }

    @PostMapping("/{orgId}/add-admin")
    public ResponseEntity<Map<String, Object>> addAdmin(
            @PathVariable String orgId,
            @RequestBody Map<String, String> body) {
        String orgUsername = body.get("orgUsername");
        String userEmail = body.get("email");
        return ResponseEntity.ok(organizationService.addAdmin(orgId, orgUsername, userEmail));
    }

    @PutMapping("/{orgId}/users/{userId}/toggle-block")
    public ResponseEntity<Map<String, Object>> toggleBlockUser(
            @PathVariable String orgId,
            @PathVariable String userId) {
        return ResponseEntity.ok(organizationService.toggleBlockUserInOrg(orgId, userId));
    }
}
