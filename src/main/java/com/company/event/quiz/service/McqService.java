package com.company.event.quiz.service;

import com.company.event.quiz.dto.*;
import com.company.event.quiz.exception.EventNotFoundException;
import com.company.event.quiz.exception.TestAlreadySubmittedException;
import com.company.event.quiz.exception.TestNotStartedException;
import com.company.event.quiz.model.Answer;
import com.company.event.quiz.model.Event;
import com.company.event.quiz.model.McqQuestion;
import com.company.event.quiz.model.McqSubmission;
import com.company.event.quiz.repository.EventRegistrationRepository;
import com.company.event.quiz.repository.EventRepository;
import com.company.event.quiz.repository.McqQuestionRepository;
import com.company.event.quiz.repository.McqSubmissionRepository;
import com.company.event.user.User;
import com.company.event.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

import java.util.*;
import java.util.stream.Collectors;

import com.company.event.websocket.RealTimeService;

@Service
@RequiredArgsConstructor
public class McqService {

        private final EventRepository eventRepository;
        private final McqQuestionRepository questionRepository;
        private final McqSubmissionRepository submissionRepository;
        private final EventRegistrationRepository registrationRepository;
        private final RealTimeService realTimeService;
        private final UserRepository userRepository;

        // ... startTest method (no changes) ...

        public List<QuestionResponseDTO> startTest(String studentId, String eventId, String pin) {

                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found"));

                if (event.getStartTime() == null || event.getEndTime() == null) {
                        throw new IllegalStateException("Event timing not configured properly");
                }

                if (event.getPin() != null && !event.getPin().trim().isEmpty()) {
                        if (pin == null || !pin.trim().equals(event.getPin().trim())) {
                                throw new IllegalStateException("Invalid Event PIN");
                        }
                }

                Instant now = Instant.now();

                if (now.isBefore(event.getStartTime()) ||
                                now.isAfter(event.getEndTime())) {
                        throw new IllegalStateException("Event not live");
                }

                // Registration check
                registrationRepository
                                .findByEventIdAndStudentId(eventId, studentId)
                                .orElseThrow(() -> new IllegalStateException("You are not registered for this event"));

                Optional<McqSubmission> existingSubmission = submissionRepository.findByStudentIdAndEventId(studentId,
                                eventId);

                // Resume support
                if (existingSubmission.isPresent()) {

                        McqSubmission submission = existingSubmission.get();

                        if ("COMPLETED".equals(submission.getStatus())) {
                                throw new TestAlreadySubmittedException("Test already submitted");

                        }

                        return questionRepository.findByEventId(eventId)
                                        .stream()
                                        .map(q -> new QuestionResponseDTO(
                                                        q.getId(),
                                                        q.getQuestionText(),
                                                        q.getOptions(),
                                                        q.getMarks()))
                                        .toList();
                }

                // Fresh start
                McqSubmission submission = new McqSubmission();
                submission.setStudentId(studentId);
                submission.setEventId(eventId);
                submission.setStartTime(now);
                submission.setStatus("IN_PROGRESS");

                submissionRepository.save(submission);

                return questionRepository.findByEventId(eventId)
                                .stream()
                                .map(q -> new QuestionResponseDTO(
                                                q.getId(),
                                                q.getQuestionText(),
                                                q.getOptions(),
                                                q.getMarks()))
                                .toList();
        }

        // ==========================
        // SUBMIT TEST
        // ==========================
        public McqResultDTO submitTest(String studentId,
                        String eventId,
                        SubmitMcqRequestDTO request) {

                if (request == null || request.getAnswers() == null) {
                        throw new IllegalArgumentException("Answers cannot be null");
                }

                McqSubmission submission = submissionRepository
                                .findByStudentIdAndEventId(studentId, eventId)
                                .orElseThrow(() -> new TestNotStartedException("Test not started"));

                if ("COMPLETED".equals(submission.getStatus())) {
                        throw new TestAlreadySubmittedException("Test already submitted");

                }

                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found"));

                if (submission.getStartTime() == null) {
                        throw new IllegalStateException("Test start time missing");
                }

                Instant now = Instant.now();

                long minutesElapsed = Duration.between(
                                submission.getStartTime(),
                                now).toMinutes();

                if (event.getDurationInMinutes() != null &&
                                minutesElapsed > event.getDurationInMinutes()) {
                        submission.setStatus("AUTO_SUBMITTED");
                }

                List<McqQuestion> questions = questionRepository.findByEventId(eventId);

                Map<String, McqQuestion> questionMap = questions.stream()
                                .collect(Collectors.toMap(McqQuestion::getId, q -> q));

                if (request.getAnswers().size() > questionMap.size()) {
                        throw new IllegalArgumentException("Invalid number of answers submitted");
                }

                double totalScore = 0.0;
                int correct = 0;
                int wrong = 0;

                for (Answer ans : request.getAnswers()) {

                        if (ans == null || ans.getQuestionId() == null) {
                                continue;
                        }

                        McqQuestion question = questionMap.get(ans.getQuestionId());
                        if (question == null) {
                                throw new IllegalArgumentException("Invalid question detected in submission");
                        }

                        boolean isCorrect = false;

                        // Check for text answer first
                        if (question.getOptions() == null || question.getOptions().isEmpty()) {
                                String userText = ans.getTextAnswer();
                                String correctText = question.getCorrectTextAnswer();

                                if (userText != null && correctText != null &&
                                                userText.trim().equalsIgnoreCase(correctText.trim())) {
                                        isCorrect = true;
                                }
                        } else {
                                List<Integer> selectedOptions = ans.getSelectedOptions();
                                List<Integer> correctOptions = question.getCorrectOptions();

                                if (Boolean.TRUE.equals(question.getIsMultipleChoice())) {
                                        // Multiple Choice: All selected options must match exactly with correct options
                                        if (selectedOptions != null && correctOptions != null &&
                                                        selectedOptions.size() == correctOptions.size() &&
                                                        new HashSet<>(selectedOptions)
                                                                        .equals(new HashSet<>(correctOptions))) {
                                                isCorrect = true;
                                        }
                                } else {
                                        // Single Choice: First selected option must match first correct option
                                        Integer selected = (selectedOptions != null && !selectedOptions.isEmpty())
                                                        ? selectedOptions.get(0)
                                                        : null;
                                        Integer correctOpt = (correctOptions != null && !correctOptions.isEmpty())
                                                        ? correctOptions.get(0)
                                                        : null;
                                        if (selected != null && correctOpt != null && selected.equals(correctOpt)) {
                                                isCorrect = true;
                                        }
                                }
                        }

                        if (isCorrect) {
                                totalScore += Optional.ofNullable(question.getMarks()).orElse(0.0);
                                correct++;
                        } else {
                                // Only subtract if they actually selected something or typed something
                                boolean hasAnswer = (ans.getSelectedOptions() != null
                                                && !ans.getSelectedOptions().isEmpty()) ||
                                                (ans.getTextAnswer() != null && !ans.getTextAnswer().trim().isEmpty());

                                if (hasAnswer) {
                                        wrong++;
                                        Double negative = question.getNegativeMarks();
                                        if (negative != null) {
                                                totalScore -= negative;
                                        }
                                }
                        }
                }

                if (totalScore < 0)
                        totalScore = 0;

                submission.setSubmittedAt(now);
                submission.setAnswers(request.getAnswers());
                submission.setTotalScore(totalScore);
                submission.setCorrectCount(correct);
                submission.setWrongCount(wrong);
                submission.setStatus("COMPLETED");

                submissionRepository.save(submission);

                // Broadcast Leaderboard Update
                realTimeService.notifyLeaderboardUpdate(eventId, getEventAnalytics(eventId).getTopPerformers());

                // Check for delayed results
                if (event.getEndTime() != null && now.isBefore(event.getEndTime().plusSeconds(10))) {
                        // Hide results if contest is not ended or within 10s buffer
                        return new McqResultDTO(-1, -1, -1, -1);
                }

                int rank = calculateRank(eventId, studentId);

                return new McqResultDTO((int) totalScore, correct, wrong, rank);
        }

        // ... calculateRank, getRemainingTime, getEventAnalytics (no changes) ...

        // ==========================
        // LEADERBOARD RANK
        // ==========================
        private int calculateRank(String eventId, String studentId) {

                List<McqSubmission> submissions = submissionRepository
                                .findByEventIdOrderByTotalScoreDescSubmittedAtAsc(eventId);

                for (int i = 0; i < submissions.size(); i++) {
                        if (studentId.equals(submissions.get(i).getStudentId())) {
                                return i + 1;
                        }
                }

                return submissions.size();
        }

        // ==========================
        // REMAINING TIME
        // ==========================
        public RemainingTimeResponseDTO getRemainingTime(String studentId, String eventId) {

                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found"));

                registrationRepository
                                .findByEventIdAndStudentId(eventId, studentId)
                                .orElseThrow(() -> new IllegalStateException("You are not registered for this event"));

                McqSubmission submission = submissionRepository
                                .findByStudentIdAndEventId(studentId, eventId)
                                .orElseThrow(() -> new TestNotStartedException("Test not started"));

                if ("COMPLETED".equals(submission.getStatus())) {
                        return new RemainingTimeResponseDTO(
                                        0,
                                        "COMPLETED",
                                        submission.getStartTime(),
                                        event.getEndTime());
                }

                if (submission.getStartTime() == null || event.getDurationInMinutes() == null) {
                        throw new IllegalStateException("Invalid timing configuration");
                }

                Instant now = Instant.now();

                long elapsedSeconds = Duration.between(
                                submission.getStartTime(),
                                now).getSeconds();

                long totalAllowedSeconds = event.getDurationInMinutes() * 60L;

                long remainingSeconds = totalAllowedSeconds - elapsedSeconds;

                if (remainingSeconds <= 0) {

                        submission.setStatus("AUTO_SUBMITTED");
                        submission.setSubmittedAt(now);
                        submissionRepository.save(submission);

                        return new RemainingTimeResponseDTO(
                                        0,
                                        "AUTO_SUBMITTED",
                                        submission.getStartTime(),
                                        event.getEndTime());
                }

                return new RemainingTimeResponseDTO(
                                remainingSeconds,
                                submission.getStatus(),
                                submission.getStartTime(),
                                event.getEndTime());
        }

        // ==========================
        // ADMIN ANALYTICS
        // ==========================
        public AdminEventAnalyticsDTO getEventAnalytics(String eventId) {

                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found"));

                long totalRegistrations = registrationRepository.countByEventId(eventId);

                List<McqSubmission> submissions = submissionRepository
                                .findByEventIdOrderByTotalScoreDescSubmittedAtAsc(eventId);

                long totalAttempts = submissions.stream()
                                .filter(s -> "COMPLETED".equals(s.getStatus()) ||
                                                "AUTO_SUBMITTED".equals(s.getStatus()))
                                .count();

                long totalAbsent = totalRegistrations - totalAttempts;

                if (submissions.isEmpty()) {
                        return new AdminEventAnalyticsDTO(
                                        totalRegistrations,
                                        0,
                                        totalRegistrations,
                                        0.0,
                                        0.0,
                                        0.0,
                                        0,
                                        List.of());
                }

                List<Double> scores = submissions.stream()
                                .map(McqSubmission::getTotalScore)
                                .filter(Objects::nonNull)
                                .toList();

                Double highestScore = scores.stream().max(Double::compareTo).orElse(0.0);
                Double lowestScore = scores.stream().min(Double::compareTo).orElse(0.0);

                double averageScore = scores.stream()
                                .mapToDouble(Double::doubleValue)
                                .average()
                                .orElse(0.0);

                int passMarks = (int) (event.getTotalMarks() * 0.4);

                long passCount = scores.stream()
                                .filter(score -> score >= passMarks)
                                .count();

                double passPercentage = totalAttempts == 0 ? 0 : (passCount * 100.0) / totalAttempts;

                List<TopPerformerDTO> topPerformers = new ArrayList<>();

                for (int i = 0; i < Math.min(10, submissions.size()); i++) {

                        McqSubmission s = submissions.get(i);

                        if (s.getTotalScore() == null)
                                continue;

                        String name = "Anonymous";
                        String branch = "N/A";

                        try {
                                Optional<User> userOpt = userRepository.findById(s.getStudentId());
                                if (userOpt.isPresent()) {
                                        User u = userOpt.get();
                                        name = u.getFirstName() + " "
                                                        + (u.getLastName() != null ? u.getLastName() : "");
                                        branch = u.getBranch() != null ? u.getBranch() : "N/A";
                                }
                        } catch (Exception e) {
                                // Ignore user fetch errors
                        }

                        topPerformers.add(
                                        new TopPerformerDTO(
                                                        s.getStudentId(),
                                                        name.trim(),
                                                        branch,
                                                        s.getTotalScore(),
                                                        i + 1));
                }

                return new AdminEventAnalyticsDTO(
                                totalRegistrations,
                                totalAttempts,
                                totalAbsent,
                                averageScore,
                                highestScore,
                                lowestScore,
                                passPercentage,
                                topPerformers);
        }

        public AdminEventAnalyticsDTO getEventAnalyticsForPdf(String eventId) {
                return getEventAnalytics(eventId);
        }

        public McqResultDTO getStudentResult(String studentId, String eventId) {
                McqSubmission submission = submissionRepository.findByStudentIdAndEventId(studentId, eventId)
                                .orElseThrow(() -> new TestNotStartedException("Test not taken"));

                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found"));

                Instant now = Instant.now();
                if (event.getEndTime() != null && now.isBefore(event.getEndTime().plusSeconds(10))) {
                        return new McqResultDTO(-1, -1, -1, -1);
                }

                int rank = calculateRank(eventId, studentId);
                int score = submission.getTotalScore() != null ? submission.getTotalScore().intValue() : 0;

                return new McqResultDTO(
                                score,
                                submission.getCorrectCount(),
                                submission.getWrongCount(),
                                rank);
        }

        public List<com.company.event.quiz.dto.McqHistoryDTO> getStudentHistory(String studentId) {
                List<McqSubmission> submissions = submissionRepository.findByStudentId(studentId);
                return submissions.stream()
                                .filter(s -> s.getEventId() != null) // Avoid null IDs
                                .map(s -> {
                                        try {
                                                Event event = eventRepository.findById(s.getEventId()).orElse(null);
                                                String eventTitle = event != null ? event.getTitle() : "Unknown Event";
                                                String orgId = event != null ? event.getOrganizationId() : null;

                                                return new com.company.event.quiz.dto.McqHistoryDTO(
                                                                s.getEventId(),
                                                                eventTitle,
                                                                orgId,
                                                                s.getTotalScore(),
                                                                s.getSubmittedAt());
                                        } catch (Exception e) {
                                                System.err.println("Error mapping submission: " + s.getId() + " - "
                                                                + e.getMessage());
                                                return null;
                                        }
                                })
                                .filter(Objects::nonNull)
                                .toList();
        }

}
