package com.company.event.quiz.repository;

import com.company.event.quiz.model.McqSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface McqSubmissionRepository extends MongoRepository<McqSubmission, String> {

    Optional<McqSubmission> findByStudentIdAndEventId(String studentId, String eventId);

    List<McqSubmission> findByEventIdOrderByTotalScoreDescSubmittedAtAsc(String eventId);
}
