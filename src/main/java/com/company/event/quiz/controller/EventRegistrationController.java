package com.company.event.quiz.controller;

import com.company.event.quiz.service.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class EventRegistrationController {

    private final EventRegistrationService registrationService;

    @PostMapping("/{eventId}")
    public ResponseEntity<?> register(@PathVariable String eventId,
                                      @RequestHeader("studentId") String studentId) {

        return ResponseEntity.ok(
                registrationService.register(studentId, eventId)
        );
    }

    @PostMapping("/cancel/{eventId}")
    public ResponseEntity<?> cancel(@PathVariable String eventId,
                                    @RequestHeader("studentId") String studentId) {

        return ResponseEntity.ok(
                registrationService.cancelRegistration(studentId, eventId)
        );
    }
}
