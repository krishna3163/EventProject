package com.company.event.contestPackage.contest;

import com.company.event.websocket.RealTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/contest")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;
    private final RealTimeService realTimeService;

    @PostMapping("/insert")
    public ResponseEntity<ContestResponse> createContest(@RequestBody ContestRequest request) {
        ContestResponse response = contestService.createContest(request);
        realTimeService.broadcastDashboardUpdate("CONTEST_CREATED");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAllContests() {
        return ResponseEntity.ok(contestService.getAllContests());
    }

    @GetMapping("/getOrgContests/{orgId}")
    public ResponseEntity<?> getOrgContests(@PathVariable String orgId) {
        return ResponseEntity.ok(contestService.getOrgContests(orgId));
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getContest(@PathVariable String id) {

        ContestResponse contest = contestService.getContestById(id);
        String status = contestService.getContestStatus(contest);

        Map<String, Object> response = new HashMap<>();
        response.put("contest", contest);
        response.put("status", status);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteContest(@PathVariable String id) {
        contestService.deleteContest(id);
        realTimeService.broadcastDashboardUpdate("CONTEST_DELETED");
        return ResponseEntity.ok("Contest deleted successfully.");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ContestResponse> updateContest(
            @PathVariable String id,
            @RequestBody ContestRequest request) {
        ContestResponse response = contestService.updateContest(request, id);
        realTimeService.broadcastDashboardUpdate("CONTEST_UPDATED");
        return ResponseEntity.ok(response);
    }
}
