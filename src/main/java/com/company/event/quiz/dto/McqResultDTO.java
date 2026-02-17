package com.company.event.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class McqResultDTO {

    private Integer totalScore;

    private Integer correct;

    private Integer wrong;

    private Integer rank;
}

