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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class McqService {

    private final EventRepository eventRepository;
    private final McqQuestionRepository questionRepository;
    private final McqSubmissionRepository submissionRepository;
    private final EventRegistrationRepository registrationRepository;

    // ==========================
    // START OR RESUME TEST
    // ==========================
    public List<QuestionResponseDTO> startTest(String studentId, String eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        if (event.getStartTime() == null || event.getEndTime() == null) {
            throw new IllegalStateException("Event timing not configured properly");
        }

        Instant now = Instant.now();

        if (now.isBefore(event.getStartTime()) ||
                now.isAfter(event.getEndTime())) {
            throw new IllegalStateException("Event not live");
        }

        // Registration check
        registrationRepository
                .findByEventIdAndStudentId(eventId, studentId)
                .orElseThrow(() ->
                        new IllegalStateException("You are not registered for this event"));

        Optional<McqSubmission> existingSubmission =
                submissionRepository.findByStudentIdAndEventId(studentId, eventId);

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
                            q.getMarks()
                    ))
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
                        q.getMarks()
                ))
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
                now
        ).toMinutes();

        if (event.getDurationInMinutes() != null &&
                minutesElapsed > event.getDurationInMinutes()) {
            submission.setStatus("AUTO_SUBMITTED");
        }

        List<McqQuestion> questions = questionRepository.findByEventId(eventId);

        Map<String, McqQuestion> questionMap =
                questions.stream()
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


            Integer selectedOption = ans.getSelectedOption();
            Integer correctOption = question.getCorrectOption();

            if (selectedOption != null &&
                    correctOption != null &&
                    selectedOption.equals(correctOption)) {

                totalScore += Optional.ofNullable(question.getMarks()).orElse(0.0);
                correct++;

            } else {

                wrong++;

                Double negative = question.getNegativeMarks();
                if (negative != null) {
                    totalScore -= negative;
                }
            }
        }

        if (totalScore < 0) totalScore = 0;

        submission.setSubmittedAt(now);
        submission.setAnswers(request.getAnswers());
        submission.setTotalScore(totalScore);
        submission.setCorrectCount(correct);
        submission.setWrongCount(wrong);
        submission.setStatus("COMPLETED");

        submissionRepository.save(submission);

        int rank = calculateRank(eventId, studentId);

        return new McqResultDTO((int) totalScore, correct, wrong, rank);
    }

    // ==========================
    // LEADERBOARD RANK
    // ==========================
    private int calculateRank(String eventId, String studentId) {

        List<McqSubmission> submissions =
                submissionRepository.findByEventIdOrderByTotalScoreDescSubmittedAtAsc(eventId);

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
                .orElseThrow(() ->
                        new IllegalStateException("You are not registered for this event"));

        McqSubmission submission = submissionRepository
                .findByStudentIdAndEventId(studentId, eventId)
                .orElseThrow(() ->
                        new TestNotStartedException("Test not started"));

        if ("COMPLETED".equals(submission.getStatus())) {
            return new RemainingTimeResponseDTO(
                    0,
                    "COMPLETED",
                    submission.getStartTime(),
                    event.getEndTime()
            );
        }

        if (submission.getStartTime() == null || event.getDurationInMinutes() == null) {
            throw new IllegalStateException("Invalid timing configuration");
        }

        Instant now = Instant.now();

        long elapsedSeconds = Duration.between(
                submission.getStartTime(),
                now
        ).getSeconds();

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
                    event.getEndTime()
            );
        }

        return new RemainingTimeResponseDTO(
                remainingSeconds,
                submission.getStatus(),
                submission.getStartTime(),
                event.getEndTime()
        );
    }

    // ==========================
    // ADMIN ANALYTICS
    // ==========================
    public AdminEventAnalyticsDTO getEventAnalytics(String eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        long totalRegistrations =
                registrationRepository.countByEventId(eventId);

        List<McqSubmission> submissions =
                submissionRepository.findByEventIdOrderByTotalScoreDescSubmittedAtAsc(eventId);

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
                    List.of()
            );
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

        double passPercentage =
                totalAttempts == 0 ? 0 :
                        (passCount * 100.0) / totalAttempts;

        List<TopPerformerDTO> topPerformers = new ArrayList<>();

        for (int i = 0; i < Math.min(10, submissions.size()); i++) {

            McqSubmission s = submissions.get(i);

            if (s.getTotalScore() == null) continue;

            topPerformers.add(
                    new TopPerformerDTO(
                            s.getStudentId(),
                            s.getTotalScore(),
                            i + 1
                    )
            );
        }

        return new AdminEventAnalyticsDTO(
                totalRegistrations,
                totalAttempts,
                totalAbsent,
                averageScore,
                highestScore,
                lowestScore,
                passPercentage,
                topPerformers
        );
    }

    public AdminEventAnalyticsDTO getEventAnalyticsForPdf(String eventId) {
        return getEventAnalytics(eventId);
    }
}
