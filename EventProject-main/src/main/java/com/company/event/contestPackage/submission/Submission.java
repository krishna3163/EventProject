package com.company.event.contestPackage.submission;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "submissions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Submission {
    @Id
    private String id;
    private String userId;
    private String contestId;
    private String problemId;
    private String code;
    private String language;
    private String verdict;   // PENDING, ACCEPTED, WRONG_ANSWER
    private Integer score;
    private Instant submittedAt;
}
