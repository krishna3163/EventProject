package com.company.event.contestPackage.leaderboard;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/{contestId}")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable String contestId) {
        return ResponseEntity.ok(
                leaderboardService.getLeaderboard(contestId)
        );
    }
}
