package com.company.event.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class McqHistoryDTO {
    private String eventId;
    private String eventTitle;
    private String organizationId;
    private Double score;
    private Instant submittedAt;
}
