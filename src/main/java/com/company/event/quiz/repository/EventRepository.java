package com.company.event.quiz.repository;

import com.company.event.quiz.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EventRepository extends MongoRepository<Event, String> {
}