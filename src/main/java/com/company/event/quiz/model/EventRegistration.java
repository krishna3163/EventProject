package com.company.event.quiz.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;


@Document(collection = "event_registrations")
@CompoundIndexes({
        @CompoundIndex(name = "event_student_unique_idx",
                def = "{'eventId':1, 'studentId':1}",
                unique = true)
})
@Data
public class EventRegistration {

    @Id
    private String id;

    private String eventId;

    private String studentId;

    private Instant registeredAt;




    private String status; // REGISTERED / CANCELLED (future-proofing)
}
