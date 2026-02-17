package com.company.event.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopPerformerDTO {

    private String studentId;
    private Double score;
    private int rank;
}
