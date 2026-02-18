package com.company.event.quiz.repository;

import com.company.event.quiz.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByOrganizationId(String organizationId);
}