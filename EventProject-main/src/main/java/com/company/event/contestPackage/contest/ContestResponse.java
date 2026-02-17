package com.company.event.contestPackage.contest;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContestResponse {
    private String id;
    private String title;
    private Instant startTime;
    private Instant endTime;
    private List<String> problemIds;
}
