package com.company.event.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AdminEventAnalyticsDTO {

    private long totalRegistrations;
    private long totalAttempts;
    private long totalAbsent;

    private Double averageScore;
    private Double highestScore;
    private Double lowestScore;

    private double passPercentage;

    private List<TopPerformerDTO> topPerformers;
}
