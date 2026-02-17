package com.company.event.contestPackage.problem;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProblemRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String description;
    @NotBlank
    private String difficulty;
    @NotBlank
    private List<TestCase> testCases;
}
