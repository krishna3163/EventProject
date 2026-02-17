package com.company.event.quiz.repository;

import com.company.event.quiz.model.McqQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface McqQuestionRepository extends MongoRepository<McqQuestion, String> {

    List<McqQuestion> findByEventId(String eventId);
}
