package com.company.event.quiz.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateQuestionDTO {

    private String questionText;

    private List<String> options;

    private Integer correctOption; // legacy support
    private List<Integer> correctOptions;
    private Boolean isMultipleChoice = false;

    private Double marks;

    private Double negativeMarks;
}
