package com.company.event.quiz.service;

import com.company.event.quiz.exception.EventNotFoundException;
import com.company.event.quiz.model.Event;
import com.company.event.quiz.model.EventRegistration;
import com.company.event.quiz.repository.EventRegistrationRepository;
import com.company.event.quiz.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class EventRegistrationService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    // ==========================
    // REGISTER FOR EVENT
    // ==========================
    public String register(String studentId, String eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if (event.getStartTime() == null) {
            throw new IllegalStateException("Event start time not configured");
        }

        Instant now = Instant.now();

        // Registration allowed only BEFORE event starts
        if (!now.isBefore(event.getStartTime())) {
            throw new IllegalStateException("Registration closed. Event already started.");
        }

        // Check duplicate registration
        registrationRepository.findByEventIdAndStudentId(eventId, studentId)
                .ifPresent(r -> {
                    throw new IllegalStateException("Already registered for this event");
                });

        EventRegistration registration = new EventRegistration();
        registration.setEventId(eventId);
        registration.setStudentId(studentId);
        registration.setRegisteredAt(now);
        registration.setStatus("REGISTERED");

        registrationRepository.save(registration);

        return "Successfully registered for event";
    }

    // ==========================
    // CANCEL REGISTRATION
    // ==========================
    public String cancelRegistration(String studentId, String eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        Instant now = Instant.now();

        // Cannot cancel after event starts
        if (!now.isBefore(event.getStartTime())) {
            throw new IllegalStateException("Cannot cancel. Event already started.");
        }

        EventRegistration registration =
                registrationRepository.findByEventIdAndStudentId(eventId, studentId)
                        .orElseThrow(() -> new IllegalStateException("Registration not found"));

        if ("CANCELLED".equals(registration.getStatus())) {
            throw new IllegalStateException("Registration already cancelled");
        }

        registration.setStatus("CANCELLED");
        registrationRepository.save(registration);

        return "Registration cancelled successfully";
    }

    // ==========================
    // TOTAL REGISTRATIONS
    // ==========================
    public long getTotalRegistrations(String eventId) {
        return registrationRepository.countByEventId(eventId);
    }
}
