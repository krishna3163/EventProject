package com.company.event.quiz.controller;

import com.company.event.quiz.model.Event;
import com.company.event.quiz.model.Registration;
import com.company.event.quiz.repository.EventRepository;
import com.company.event.quiz.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class RegistrationController {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final com.company.event.user.UserService userService;

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        log.info("User {} registering for event {}", userId, id);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (registrationRepository.findByUserIdAndEventId(userId, id).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "User already registered for this event"));
        }

        long participants = registrationRepository.countByEventId(id);
        if (event.getMaxParticipants() != null && participants >= event.getMaxParticipants()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Event is full"));
        }

        Registration registration = Registration.builder()
                .userId(userId)
                .eventId(id)
                .registrationDate(LocalDateTime.now())
                .build();

        registrationRepository.save(registration);

        return ResponseEntity.status(HttpStatus.CREATED).body(registration);
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable String id) {
        return ResponseEntity.ok(registrationRepository.findByEventId(id));
    }

    @DeleteMapping("/{id}/unregister")
    public ResponseEntity<?> unregister(@PathVariable String id, @RequestParam String userId) {
        registrationRepository.deleteByUserIdAndEventId(userId, id);
        return ResponseEntity.ok(Map.of("message", "Unregistered successfully"));
    }
}
