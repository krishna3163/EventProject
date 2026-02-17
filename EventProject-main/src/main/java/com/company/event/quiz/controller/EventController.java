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

    // GET ALL EVENTS
    @GetMapping("/getAllEvent")
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
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
        return eventRepository.findById(id)
                .map(existing -> {
                    if (updatedEvent.getTitle() != null)
                        existing.setTitle(updatedEvent.getTitle());
                    if (updatedEvent.getType() != null)
                        existing.setType(updatedEvent.getType());
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
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        return ResponseEntity.ok().body("Event deleted successfully");
    }
}