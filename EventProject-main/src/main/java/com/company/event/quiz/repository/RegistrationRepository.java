package com.company.event.quiz.repository;

import com.company.event.quiz.model.Registration;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends MongoRepository<Registration, String> {
    List<Registration> findByEventId(String eventId);

    List<Registration> findByUserId(String userId);

    Optional<Registration> findByUserIdAndEventId(String userId, String eventId);

    long countByEventId(String eventId);

    void deleteByUserIdAndEventId(String userId, String eventId);
}
