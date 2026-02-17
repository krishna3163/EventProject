package com.company.event.contestPackage.contest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContestService {

    private final ContestRepository contestRepository;

    public ContestResponse createContest(ContestRequest request) {

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time must be before end time"
            );
        }

        Contest contest = Contest.builder()
                .title(request.getTitle())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .problemIds(request.getProblemIds())
                .build();

        return mapToResponse(contestRepository.save(contest));
    }

    public List<ContestResponse> getAllContests() {
        return contestRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ContestResponse getContestById(String id) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Contest not found"
                ));

        return mapToResponse(contest);
    }

    public String getContestStatus(ContestResponse contest) {

        Instant now = Instant.now();

        if (now.isBefore(contest.getStartTime())) {
            return "UPCOMING";
        } else if (now.isAfter(contest.getEndTime())) {
            return "ENDED";
        } else {
            return "LIVE";
        }
    }

    public void deleteContest(String id) {
        if (!contestRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Contest not found"
            );
        }
        contestRepository.deleteById(id);
    }

    public ContestResponse updateContest(ContestRequest request, String id) {

        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Contest not found"
                ));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time must be before end time"
            );
        }

        contest.setTitle(request.getTitle());
        contest.setStartTime(request.getStartTime());
        contest.setEndTime(request.getEndTime());
        contest.setProblemIds(request.getProblemIds());

        return mapToResponse(contestRepository.save(contest));
    }

    private ContestResponse mapToResponse(Contest contest) {
        return ContestResponse.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .problemIds(contest.getProblemIds())
                .build();
    }
}
