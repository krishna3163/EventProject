package com.company.event.quiz.controller;

import com.company.event.quiz.model.Event;
import com.company.event.quiz.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class EventController {

    private final EventRepository eventRepository;

    // CREATE EVENT
    @PostMapping("/createEvent")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        log.info("Creating new event: {}", event.getTitle());

        if (event.getStartTime() == null || event.getEndTime() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Start time and end time required"));
        }

        if (!event.getStartTime().isBefore(event.getEndTime())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Start time must be before end time"));
        }

        if (event.getStartTime().isBefore(Instant.now())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Start time must be in the future"));
        }

        event.setAttendanceProcessed(false);

        return ResponseEntity.ok(eventRepository.save(event));
    }

    // GET ALL EVENTS (With Pagination, Search, and Filtering)
    @GetMapping("/getAllEvent")
    public ResponseEntity<?> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {

        log.info("Fetching events with filters: page={}, size={}, search={}, status={}, type={}",
                page, size, search, status, type);

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        org.springframework.data.domain.Page<Event> eventPage;

        if (search != null || status != null || type != null) {
            eventPage = eventRepository.findByTitleContainingIgnoreCaseAndStatusAndType(
                    search != null ? search : "",
                    status != null ? status : "",
                    type != null ? type : "",
                    pageable);
        } else {
            eventPage = eventRepository.findAll(pageable);
        }

        return ResponseEntity.ok(Map.of(
                "events", eventPage.getContent(),
                "currentPage", eventPage.getNumber(),
                "totalItems", eventPage.getTotalElements(),
                "totalPages", eventPage.getTotalPages()));
    }

    // GET SINGLE EVENT
    @GetMapping("/getEventById/{id}")
    public ResponseEntity<?> getEvent(@PathVariable String id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // UPDATE EVENT
    @PutMapping("/updateEvent/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable String id,
            @RequestBody Event updatedEvent) {
        log.info("Updating event ID: {}", id);
        return eventRepository.findById(id)
                .map(existing -> {
                    if (updatedEvent.getTitle() != null)
                        existing.setTitle(updatedEvent.getTitle());
                    if (updatedEvent.getDescription() != null)
                        existing.setDescription(updatedEvent.getDescription());
                    if (updatedEvent.getType() != null)
                        existing.setType(updatedEvent.getType());
                    if (updatedEvent.getMaxParticipants() != null)
                        existing.setMaxParticipants(updatedEvent.getMaxParticipants());
                    if (updatedEvent.getStartTime() != null)
                        existing.setStartTime(updatedEvent.getStartTime());
                    if (updatedEvent.getEndTime() != null)
                        existing.setEndTime(updatedEvent.getEndTime());
                    if (updatedEvent.getDurationInMinutes() != null)
                        existing.setDurationInMinutes(updatedEvent.getDurationInMinutes());
                    if (updatedEvent.getTotalMarks() != null)
                        existing.setTotalMarks(updatedEvent.getTotalMarks());
                    if (updatedEvent.getStatus() != null)
                        existing.setStatus(updatedEvent.getStatus());

                    return ResponseEntity.ok(eventRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE EVENT
    @DeleteMapping("/deleteEvent/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        log.warn("Deleting event ID: {}", id);
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        return ResponseEntity.ok().body(Map.of("message", "Event deleted successfully"));
    }
}