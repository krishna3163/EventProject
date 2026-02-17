package com.company.event.quiz.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RemainingTimeResponseDTO {

    private long remainingSeconds;
    private String status;
    private Instant startedAt;
    private Instant eventEndTime;
}
