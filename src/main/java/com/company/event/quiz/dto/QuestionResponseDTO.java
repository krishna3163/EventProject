package com.company.event.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class QuestionResponseDTO {

    private String id;

    private String questionText;

    private List<String> options;

    private Double marks;
}
