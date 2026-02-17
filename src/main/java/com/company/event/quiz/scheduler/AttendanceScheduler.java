package com.company.event.quiz.scheduler;

import com.company.event.quiz.model.Event;
import com.company.event.quiz.model.EventRegistration;
import com.company.event.quiz.model.McqSubmission;
import com.company.event.quiz.repository.EventRegistrationRepository;
import com.company.event.quiz.repository.EventRepository;
import com.company.event.quiz.repository.McqSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AttendanceScheduler {

    private final EventRepository eventRepository;
    private final McqSubmissionRepository submissionRepository;
    private final EventRegistrationRepository registrationRepository;

    @Scheduled(cron = "0 */2 * * * ?")
    public void markAbsentStudents() {

        Instant now = Instant.now();

        List<Event> events = eventRepository.findAll();

        for (Event event : events) {

            // Process only MCQ events that ended and not yet processed
            if ("MCQ".equals(event.getType()) &&
                    event.getEndTime() != null &&
                    now.isAfter(event.getEndTime()) &&
                    Boolean.FALSE.equals(event.getAttendanceProcessed())) {

                List<EventRegistration> registrations =
                        registrationRepository.findByEventId(event.getId());

                for (EventRegistration registration : registrations) {

                    String studentId = registration.getStudentId();

                    boolean alreadySubmitted =
                            submissionRepository
                                    .findByStudentIdAndEventId(studentId, event.getId())
                                    .isPresent();

                    if (!alreadySubmitted) {

                        McqSubmission absent = new McqSubmission();
                        absent.setStudentId(studentId);
                        absent.setEventId(event.getId());
                        absent.setStatus("ABSENT");
                        absent.setTotalScore(0.0);
                        absent.setCorrectCount(0);
                        absent.setWrongCount(0);
                        absent.setSubmittedAt(now);

                        submissionRepository.save(absent);
                    }
                }

                // Mark attendance processed
                event.setAttendanceProcessed(true);
                eventRepository.save(event);
            }
        }
    }
}
