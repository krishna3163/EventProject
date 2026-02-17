package com.company.event.quiz.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "mcq_submissions")
@CompoundIndexes({
        @CompoundIndex(name = "event_student_idx", def = "{'eventId':1, 'studentId':1}", unique = true)
})

@Data
public class McqSubmission {

    @Id
    private String id;

    @Indexed
    private String studentId;

    @Indexed
    private String eventId;

    private Instant startTime;

    private Instant submittedAt;

    private String status; // IN_PROGRESS, COMPLETED, AUTO_SUBMITTED

    @Indexed
    private Double totalScore;

    private Integer correctCount;

    private Integer wrongCount;

    private Integer attemptedCount;


    private List<Answer> answers;
}