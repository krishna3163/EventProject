package com.company.event.quiz.repository;

import com.company.event.quiz.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EventRepository extends MongoRepository<Event, String> {
    Page<Event> findByTitleContainingIgnoreCaseAndStatusAndType(
            String title, String status, String type, Pageable pageable);

    Page<Event> findByStatus(String status, Pageable pageable);
}