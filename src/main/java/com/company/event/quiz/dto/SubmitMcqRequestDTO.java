package com.company.event.quiz.dto;

import com.company.event.quiz.model.Answer;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SubmitMcqRequestDTO {

    @NotEmpty
    private List<Answer> answers;
}
