package com.company.event.contestPackage.problem;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProblemService {
    private final ProblemRepository repository;

    public ProblemResponse insertProblem(ProblemRequest problemRequest) {
        Problem problem = new Problem();
        problem.setDescription(problemRequest.getDescription());
        problem.setDifficulty(problemRequest.getDifficulty());
        problem.setTitle(problemRequest.getTitle());
        problem.setTestCases(problemRequest.getTestCases());
        try {
            problem = repository.save(problem);
        } catch (Exception e) {
            throw new RuntimeException("Problem could not be saved");
        }
        ProblemResponse response = new ProblemResponse();
        response.setId(problem.getId());
        response.setDescription(problem.getDescription());
        response.setDifficulty(problem.getDifficulty());
        response.setTitle(problem.getTitle());
        response.setTestCases(problem.getTestCases());
        return response;
    }

    public List<ProblemResponse> getAllProblems() {
        List<Problem> problems = new ArrayList<>();
        try {
            problems = repository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("Problem could not find.");
        }
        List<ProblemResponse> responseList = new ArrayList<>();
        for (Problem problem : problems) {
            ProblemResponse response = new ProblemResponse();
            response.setId(problem.getId());
            response.setDescription(problem.getDescription());
            response.setDifficulty(problem.getDifficulty());
            response.setTitle(problem.getTitle());
            response.setTestCases(problem.getTestCases());
            responseList.add(response);
        }
        return responseList;
    }

    public ProblemResponse getProblemById(String id) {
        Problem problem = new Problem();
        problem = repository.findById(id).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Problem not found"
        ));
        ProblemResponse response = new ProblemResponse();
        response.setId(problem.getId());
        response.setDescription(problem.getDescription());
        response.setDifficulty(problem.getDifficulty());
        response.setTitle(problem.getTitle());
        response.setTestCases(problem.getTestCases());
        return response;
    }

    public void deleteProblemById(String id) {
        Problem problem ;
        problem = repository.findById(id).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Problem not found"
        ));
        repository.delete(problem);
    }

    public ProblemResponse updateProblem(ProblemRequest problemRequest,String id) {
        Problem problem ;
        problem = repository.findById(id).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Problem not found"
        ));
        problem.setDescription(problemRequest.getDescription());
        problem.setDifficulty(problemRequest.getDifficulty());
        problem.setTitle(problemRequest.getTitle());
        problem.setTestCases(problemRequest.getTestCases());
        problem.setId(problem.getId());
        problem = repository.save(problem);
        ProblemResponse response = new ProblemResponse();
        response.setId(problem.getId());
        response.setDescription(problem.getDescription());
        response.setDifficulty(problem.getDifficulty());
        response.setTitle(problem.getTitle());
        response.setTestCases(problem.getTestCases());
        return response;
    }
}
