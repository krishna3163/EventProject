package com.company.event.quiz.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "mcq_questions")
@Data
public class McqQuestion {

    @Id
    private String id;

    @Indexed
    private String eventId;

    private String questionText;

    private List<String> options;

    private Integer correctOption;

    private Double marks;

    private Double negativeMarks;
}
