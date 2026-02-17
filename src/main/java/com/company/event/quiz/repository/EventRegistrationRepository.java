package com.company.event.quiz.repository;

import com.company.event.quiz.model.EventRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository
        extends MongoRepository<EventRegistration, String> {

    Optional<EventRegistration> findByEventIdAndStudentId(String eventId, String studentId);

    List<EventRegistration> findByEventId(String eventId);

    long countByEventId(String eventId);
}
