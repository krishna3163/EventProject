package com.company.event.contestPackage.contest;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestRequest {
    @NotNull
    private String title;
    @NotNull
    private Instant startTime;
    @NotNull
    private Instant endTime;
    @NotNull
    private List<String> problemIds;
}
