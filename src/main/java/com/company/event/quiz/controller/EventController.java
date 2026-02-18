package com.company.event.quiz.controller;

import com.company.event.quiz.model.Event;
import com.company.event.quiz.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepository;

    // CREATE EVENT
    @PostMapping("/createEvent")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {

        if (event.getStartTime() == null || event.getEndTime() == null) {
            return ResponseEntity.badRequest()
                    .body("Start time and end time required");
        }

        if (!event.getStartTime().isBefore(event.getEndTime())) {
            return ResponseEntity.badRequest()
                    .body("Start time must be before end time");
        }

        if (event.getStartTime().isBefore(Instant.now())) {
            return ResponseEntity.badRequest()
                    .body("Start time must be in the future");
        }

        event.setAttendanceProcessed(false);

        return ResponseEntity.ok(eventRepository.save(event));
    }

    // UPDATE EVENT
    @PutMapping("/updateEvent/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable String id, @RequestBody Event eventDetails) {
        return eventRepository.findById(id)
                .map(event -> {
                    event.setTitle(eventDetails.getTitle());
                    event.setDurationInMinutes(eventDetails.getDurationInMinutes());
                    event.setTotalMarks(eventDetails.getTotalMarks());
                    event.setStartTime(eventDetails.getStartTime());
                    event.setEndTime(eventDetails.getEndTime());
                    event.setOrganizationId(eventDetails.getOrganizationId());
                    event.setImageUrl(eventDetails.getImageUrl());
                    event.setStatus(eventDetails.getStatus());
                    return ResponseEntity.ok(eventRepository.save(event));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE EVENT
    @DeleteMapping("/deleteEvent/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        return ResponseEntity.ok("Event deleted successfully");
    }

    // GET ALL EVENTS (Public or Super Admin)
    @GetMapping("/getAllEvent")
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // GET ORG SPECIFIC EVENTS
    @GetMapping("/getOrgEvents/{orgId}")
    public List<Event> getOrgEvents(@PathVariable String orgId) {
        return eventRepository.findByOrganizationId(orgId);
    }

    // GET SINGLE EVENT
    @GetMapping("/getEventById/{id}")
    public ResponseEntity<?> getEvent(@PathVariable String id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}