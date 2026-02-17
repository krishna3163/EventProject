package com.company.event.contestPackage.submission;

import com.company.event.contestPackage.contest.Contest;
import com.company.event.contestPackage.contest.ContestRepository;
import com.company.event.contestPackage.problem.Problem;
import com.company.event.contestPackage.problem.ProblemRepository;
import com.company.event.contestPackage.problem.TestCase;
import com.company.event.user.User;
import com.company.event.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final ContestRepository contestRepository;
    private final UserRepository userRepository;
    private final JDoodleService jDoodleService;

    public SubmissionResponse submitCode(SubmissionRequest request) {

        Contest contest = contestRepository.findById(request.getContestId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Contest not found"));

        Instant now = Instant.now();

        if (now.isBefore(contest.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Contest has not started yet"
            );
        }

        if (now.isAfter(contest.getEndTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Contest has ended"
            );
        }

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Problem not found"));

        userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Submission submission = Submission.builder()
                .userId(request.getUserId())
                .contestId(request.getContestId())
                .problemId(request.getProblemId())
                .code(request.getCode())
                .language(request.getLanguage())
                .verdict("PENDING")
                .score(0)
                .submittedAt(now)
                .build();

        submission = submissionRepository.save(submission);

        int passedCount = 0;
        int totalCases = problem.getTestCases().size();

        for (TestCase testCase : problem.getTestCases()) {

            Map<String, Object> result = jDoodleService.executeCode(
                    normalize(submission.getCode()),
                    getLanguageParam(submission.getLanguage()),
                    getVersionIndex(submission.getLanguage()),
                    normalize(testCase.getInput())
            );

            String output = result.get("output") != null
                    ? ((String) result.get("output")).trim()
                    : "";

            String expected = testCase.getExpectedOutput().trim();

            if (output.equals(expected)) {
                passedCount++;
            }
        }

        int score = (int) ((passedCount / (double) totalCases) * 100);
        String verdict = passedCount == totalCases
                ? "ACCEPTED"
                : "WRONG_ANSWER";

        submission.setScore(score);
        submission.setVerdict(verdict);

        submission = submissionRepository.save(submission);

        return mapToResponse(submission);
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .userId(submission.getUserId())
                .contestId(submission.getContestId())
                .problemId(submission.getProblemId())
                .code(submission.getCode())
                .language(submission.getLanguage())
                .verdict(submission.getVerdict())
                .score(submission.getScore())
                .submittedAt(submission.getSubmittedAt())
                .build();
    }


    private String getLanguageParam(String lang) {
        return switch (lang.toLowerCase()) {
            case "python" -> "python3";
            case "java" -> "java";
            case "c" -> "c";
            case "cpp" -> "cpp14";
            default -> throw new RuntimeException("Unsupported language");
        };
    }

    private String getVersionIndex(String lang) {
        return switch (lang.toLowerCase()) {
            case "python" -> "3";
            case "java" -> "4";
            case "c" -> "5";
            case "cpp" -> "3";
            default -> "0";
        };
    }

    private String normalize(String text) {
        if (text == null) return "";
        text = text.replace("\r\n", "\n");
        text = text.replace("\r", "\n");
        if (!text.endsWith("\n")) {
            text += "\n";
        }
        return text;
    }

    public List<SubmissionResponse> getSubmissions() {
        List<SubmissionResponse> submissions = new ArrayList<>();
        List<Submission> submissionList = submissionRepository.findAll();
        for (Submission submission1 : submissionList) {
            SubmissionResponse submissionResponse = new SubmissionResponse();
            submissionResponse.setId(submission1.getId());
            submissionResponse.setCode(submission1.getCode());
            submissionResponse.setLanguage(submission1.getLanguage());
            submissionResponse.setVerdict(submission1.getVerdict());
            submissionResponse.setScore(submission1.getScore());
            submissionResponse.setContestId(submission1.getContestId());
            submissionResponse.setUserId(submission1.getUserId());
            submissionResponse.setProblemId(submission1.getProblemId());
            submissionResponse.setSubmittedAt(submission1.getSubmittedAt());
            submissions.add(submissionResponse);
        }
        return submissions;
    }

    public SubmissionResponse getSubmissionById(String id) {
        Submission submission1 = submissionRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));
        SubmissionResponse submissionResponse = new SubmissionResponse();
        submissionResponse.setId(submission1.getId());
        submissionResponse.setCode(submission1.getCode());
        submissionResponse.setLanguage(submission1.getLanguage());
        submissionResponse.setVerdict(submission1.getVerdict());
        submissionResponse.setScore(submission1.getScore());
        submissionResponse.setContestId(submission1.getContestId());
        submissionResponse.setUserId(submission1.getUserId());
        submissionResponse.setProblemId(submission1.getProblemId());
        submissionResponse.setSubmittedAt(submission1.getSubmittedAt());
        return submissionResponse;
    }

    public List<SubmissionResponse> getSubmissionByUserId(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        List<SubmissionResponse> submissions = new ArrayList<>();
        List<Submission> submissionList = submissionRepository.findAllByUserId(userId);
        for (Submission submission1 : submissionList) {
            SubmissionResponse submissionResponse = new SubmissionResponse();
            submissionResponse.setId(submission1.getId());
            submissionResponse.setCode(submission1.getCode());
            submissionResponse.setLanguage(submission1.getLanguage());
            submissionResponse.setVerdict(submission1.getVerdict());
            submissionResponse.setScore(submission1.getScore());
            submissionResponse.setContestId(submission1.getContestId());
            submissionResponse.setUserId(submission1.getUserId());
            submissionResponse.setProblemId(submission1.getProblemId());
            submissionResponse.setSubmittedAt(submission1.getSubmittedAt());
            submissions.add(submissionResponse);
        }
        return submissions;
    }

    public List<SubmissionResponse> getSubmissionByContestId(String contestId) {
        Contest contest = contestRepository.findById(contestId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contest not found"));
        List<SubmissionResponse> submissions = new ArrayList<>();
        List<Submission> submissionList = submissionRepository.findAllByContestId(contestId);
        for (Submission submission1 : submissionList) {
            SubmissionResponse submissionResponse = new SubmissionResponse();
            submissionResponse.setId(submission1.getId());
            submissionResponse.setCode(submission1.getCode());
            submissionResponse.setLanguage(submission1.getLanguage());
            submissionResponse.setVerdict(submission1.getVerdict());
            submissionResponse.setScore(submission1.getScore());
            submissionResponse.setContestId(submission1.getContestId());
            submissionResponse.setUserId(submission1.getUserId());
            submissionResponse.setProblemId(submission1.getProblemId());
            submissionResponse.setSubmittedAt(submission1.getSubmittedAt());
            submissions.add(submissionResponse);
        }
        return submissions;
    }

    public List<SubmissionResponse> getSubmissionByProblemId(String problemId) {
        Problem problem = problemRepository.findById(problemId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found"));
        List<SubmissionResponse> submissions = new ArrayList<>();
        List<Submission> submissionList = submissionRepository.findAllByProblemId(problemId);
        for (Submission submission1 : submissionList) {
            SubmissionResponse submissionResponse = new SubmissionResponse();
            submissionResponse.setId(submission1.getId());
            submissionResponse.setCode(submission1.getCode());
            submissionResponse.setLanguage(submission1.getLanguage());
            submissionResponse.setVerdict(submission1.getVerdict());
            submissionResponse.setScore(submission1.getScore());
            submissionResponse.setContestId(submission1.getContestId());
            submissionResponse.setUserId(submission1.getUserId());
            submissionResponse.setProblemId(submission1.getProblemId());
            submissionResponse.setSubmittedAt(submission1.getSubmittedAt());
            submissions.add(submissionResponse);
        }
        return submissions;
    }
}
