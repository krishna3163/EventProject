package com.company.event.contestPackage.submission;

import lombok.*;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubmissionResponse {
    private String id;
    private String userId;
    private String contestId;
    private String problemId;
    private String code;
    private String language;
    private String verdict;
    private Integer score;
    private Instant submittedAt;
}
