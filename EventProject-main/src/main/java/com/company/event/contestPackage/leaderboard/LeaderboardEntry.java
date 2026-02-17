package com.company.event.contestPackage.leaderboard;

import lombok.*;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LeaderboardEntry {
    private String userId;
    private int totalScore;
    private int problemsSolved;
    private Instant lastSubmissionTime;
}
