package com.company.event.contestPackage.problem;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProblemResponse {
    private String id;
    private String title;
    private String description;
    private String difficulty;
    private List<TestCase> testCases;
}
