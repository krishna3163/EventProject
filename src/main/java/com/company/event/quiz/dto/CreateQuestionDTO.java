package com.company.event.quiz.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateQuestionDTO {

    private String questionText;

    private List<String> options;

    private Integer correctOption;

    private Double marks;

    private Double negativeMarks;
}
