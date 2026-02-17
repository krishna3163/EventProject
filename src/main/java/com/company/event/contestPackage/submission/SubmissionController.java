package com.company.event.contestPackage.submission;

import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submission")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<SubmissionResponse> submitCode(
            @RequestBody SubmissionRequest submissionRequest) {

        return ResponseEntity.ok(
                submissionService.submitCode(submissionRequest)
        );
    }

    @GetMapping
    public ResponseEntity<?> getSubmissions() {
        return ResponseEntity.ok(submissionService.getSubmissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmissionsById(@PathVariable String id) {
        return ResponseEntity.ok(
                submissionService.getSubmissionById(id)
        );
    }

    @GetMapping("/userId/{userId}")
    public ResponseEntity<?> getSubmissionsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(
                submissionService.getSubmissionByUserId(userId)
        );
    }

    @GetMapping("/contestId/{contestId}")
    public ResponseEntity<?> getSubmissionsByContestId(@PathVariable String contestId) {
        return ResponseEntity.ok(
                submissionService.getSubmissionByContestId(contestId)
        );
    }

    @GetMapping("/problemId/{problemId}")
    public ResponseEntity<?> getSubmissionsByProblemId(@PathVariable String problemId) {
        return ResponseEntity.ok(
                submissionService.getSubmissionByProblemId(problemId)
        );
    }
}
