package com.company.event.quiz.controller;

import com.company.event.quiz.dto.AdminEventAnalyticsDTO;
import com.company.event.quiz.dto.SubmitMcqRequestDTO;
import com.company.event.quiz.model.Event;
import com.company.event.quiz.repository.EventRepository;
import com.company.event.quiz.service.McqService;
import com.company.event.quiz.service.PdfExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/mcq")
@RequiredArgsConstructor
public class McqController {

    private final McqService mcqService;

    private final PdfExportService pdfExportService;

    private final EventRepository eventRepository;


    @PostMapping("/start/{eventId}")
    public ResponseEntity<?> start(@PathVariable String eventId,
                                   @RequestHeader("studentId") String studentId) {

        return ResponseEntity.ok(mcqService.startTest(studentId, eventId));
    }

    @PostMapping("/submit/{eventId}")
    public ResponseEntity<?> submit(@PathVariable String eventId,
                                    @RequestHeader("studentId") String studentId,
                                    @RequestBody SubmitMcqRequestDTO request) {

        return ResponseEntity.ok(mcqService.submitTest(studentId, eventId, request));
    }

    @GetMapping("/remaining-time/{eventId}")
    public ResponseEntity<?> getRemainingTime(
            @PathVariable String eventId,
            @RequestHeader("studentId") String studentId) {

        return ResponseEntity.ok(
                mcqService.getRemainingTime(studentId, eventId)
        );
    }

    @GetMapping("/admin/analytics/{eventId}")
    public ResponseEntity<?> getEventAnalytics(
            @PathVariable String eventId) {

        return ResponseEntity.ok(
                mcqService.getEventAnalytics(eventId)
        );
    }



    @GetMapping("/admin/analytics/pdf/{eventId}")
    public ResponseEntity<byte[]> exportAnalyticsPdf(@PathVariable String eventId) {

        AdminEventAnalyticsDTO analytics =
                mcqService.getEventAnalytics(eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        ByteArrayInputStream pdfStream =
                pdfExportService.generateAnalyticsPdf(analytics, event.getTitle());

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=analytics-report.pdf")
                .header("Content-Type", "application/pdf")
                .body(pdfStream.readAllBytes());
    }



}

