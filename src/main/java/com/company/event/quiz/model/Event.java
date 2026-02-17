package com.company.event.quiz.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Document(collection = "events")
@Data
public class Event {

    @Id
    private String id;

    private String title;

    private String type; // MCQ

    private Instant startTime;

    private Instant endTime;

    private Integer durationInMinutes;

    private Boolean attendanceProcessed = false;


    private Integer totalMarks;

    private String status; // UPCOMING, LIVE, COMPLETED
}
