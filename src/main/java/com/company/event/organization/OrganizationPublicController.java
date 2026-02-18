package com.company.event.organization;

import com.company.event.quiz.model.Event;
import com.company.event.quiz.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/org")
@RequiredArgsConstructor
public class OrganizationPublicController {

    private final OrganizationService organizationService;
    private final EventRepository eventRepository;

    @GetMapping("/{orgId}")
    public ResponseEntity<Organization> getOrgProfile(@PathVariable String orgId) {
        return organizationService.getById(orgId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{orgId}/events")
    public ResponseEntity<List<Event>> getOrgEvents(@PathVariable String orgId) {
        List<Event> events = eventRepository.findByOrganizationId(orgId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Organization>> searchOrganizations(@RequestParam String query) {
        // Simple search by username or name - strictly could be done via repository
        // custom query
        // For now, let's just fetch all and filter in memory if the dataset is small,
        // OR add a repository method.
        // Let's assume we want to find by name containing query.
        // Since I can't easily add repository methods without viewing it, I'll rely on
        // what I have.
        // Actually, OrganizationService has getAllOrganizations.

        List<Organization> all = organizationService.getAllOrganizations();
        List<Organization> filtered = all.stream()
                .filter(o -> (o.getName() != null && o.getName().toLowerCase().contains(query.toLowerCase())) ||
                        (o.getUsername() != null && o.getUsername().toLowerCase().contains(query.toLowerCase())))
                .toList();

        return ResponseEntity.ok(filtered);
    }
}
