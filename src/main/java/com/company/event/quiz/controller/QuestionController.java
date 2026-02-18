package com.company.event.quiz.controller;

import com.company.event.quiz.dto.CreateQuestionDTO;
import com.company.event.quiz.model.Event;
import com.company.event.quiz.model.McqQuestion;
import com.company.event.quiz.repository.EventRepository;
import com.company.event.quiz.repository.McqQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

        private final McqQuestionRepository questionRepository;
        private final EventRepository eventRepository;

        @GetMapping("/event/{eventId}")
        public ResponseEntity<?> getQuestionsByEvent(@PathVariable String eventId) {
                return ResponseEntity.ok(questionRepository.findByEventId(eventId));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<?> deleteQuestion(@PathVariable String id) {
                questionRepository.deleteById(id);
                return ResponseEntity.ok("Question deleted successfully");
        }

        @PostMapping("/{eventId}")
        public ResponseEntity<?> addQuestion(@PathVariable String eventId,
                        @RequestBody CreateQuestionDTO request) {

                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new RuntimeException("Event not found"));

                if (!Instant.now().isBefore(event.getStartTime())) {
                        return ResponseEntity.badRequest()
                                        .body("Cannot add questions after event has started");
                }

                // Validation
                if (request.getQuestionText() == null ||
                                request.getOptions() == null ||
                                request.getOptions().size() < 2 ||
                                request.getMarks() == null) {

                        return ResponseEntity.badRequest()
                                        .body("Invalid question format");
                }

                if (Boolean.TRUE.equals(request.getIsMultipleChoice())) {
                        if (request.getCorrectOptions() == null || request.getCorrectOptions().isEmpty()) {
                                return ResponseEntity.badRequest().body(
                                                "Multiple choice questions must have at least one correct option");
                        }
                        for (Integer opt : request.getCorrectOptions()) {
                                if (opt >= request.getOptions().size()) {
                                        return ResponseEntity.badRequest().body("Invalid correct option index: " + opt);
                                }
                        }
                } else {
                        if (request.getCorrectOption() == null) {
                                return ResponseEntity.badRequest()
                                                .body("Single choice questions must have a correct option");
                        }
                        if (request.getCorrectOption() >= request.getOptions().size()) {
                                return ResponseEntity.badRequest().body("Correct option index invalid");
                        }
                }

                McqQuestion question = new McqQuestion();
                question.setEventId(eventId);
                question.setOrganizationId(event.getOrganizationId());
                question.setQuestionText(request.getQuestionText());
                question.setOptions(request.getOptions());
                question.setIsMultipleChoice(request.getIsMultipleChoice());

                if (Boolean.TRUE.equals(request.getIsMultipleChoice())) {
                        question.setCorrectOptions(request.getCorrectOptions());
                        question.setCorrectOption(request.getCorrectOptions().get(0)); // for backward compatibility
                } else {
                        question.setCorrectOption(request.getCorrectOption());
                        question.setCorrectOptions(List.of(request.getCorrectOption()));
                }

                question.setMarks(request.getMarks());
                question.setNegativeMarks(
                                request.getNegativeMarks() == null ? 0.0 : request.getNegativeMarks());

                return ResponseEntity.ok(questionRepository.save(question));
        }

        @PostMapping("/bulk/{eventId}")
        public ResponseEntity<?> addBulkQuestions(@PathVariable String eventId,
                        @RequestBody List<CreateQuestionDTO> questions) {

                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new RuntimeException("Event not found"));

                if (!Instant.now().isBefore(event.getStartTime())) {
                        return ResponseEntity.badRequest()
                                        .body("Cannot add questions after event has started");
                }

                List<McqQuestion> questionList = new ArrayList<>();

                for (CreateQuestionDTO req : questions) {

                        if (req.getQuestionText() == null ||
                                        req.getOptions() == null ||
                                        req.getOptions().size() < 2 ||
                                        req.getMarks() == null) {

                                return ResponseEntity.badRequest()
                                                .body("Invalid question in bulk upload");
                        }

                        if (Boolean.TRUE.equals(req.getIsMultipleChoice())) {
                                if (req.getCorrectOptions() == null || req.getCorrectOptions().isEmpty()) {
                                        return ResponseEntity.badRequest().body(
                                                        "Multiple choice questions must have at least one correct option");
                                }
                        } else {
                                if (req.getCorrectOption() == null) {
                                        return ResponseEntity.badRequest()
                                                        .body("Single choice questions must have a correct option");
                                }
                        }

                        McqQuestion q = new McqQuestion();
                        q.setEventId(eventId);
                        q.setOrganizationId(event.getOrganizationId());
                        q.setQuestionText(req.getQuestionText());
                        q.setOptions(req.getOptions());
                        q.setIsMultipleChoice(req.getIsMultipleChoice());

                        if (Boolean.TRUE.equals(req.getIsMultipleChoice())) {
                                q.setCorrectOptions(req.getCorrectOptions());
                                if (!req.getCorrectOptions().isEmpty()) {
                                        q.setCorrectOption(req.getCorrectOptions().get(0));
                                }
                        } else {
                                q.setCorrectOption(req.getCorrectOption());
                                q.setCorrectOptions(List.of(req.getCorrectOption()));
                        }

                        q.setMarks(req.getMarks().doubleValue());
                        q.setNegativeMarks(
                                        req.getNegativeMarks() == null ? 0.0 : req.getNegativeMarks());

                        questionList.add(q);
                }

                return ResponseEntity.ok(questionRepository.saveAll(questionList));
        }

}
