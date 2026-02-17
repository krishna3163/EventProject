package com.company.event.contestPackage.problem;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/problem")
@RequiredArgsConstructor
public class ProblemController {
    private final ProblemService problemService;

    @PostMapping("/insert")
    public ResponseEntity<?> create(@RequestBody ProblemRequest problemRequest) {
        ProblemResponse problemResponse;
        try {
            problemResponse = problemService.insertProblem(problemRequest);
        } catch (Exception e) {
            return new ResponseEntity<>("Problem not created.",HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(problemResponse,HttpStatus.CREATED);
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<ProblemResponse> responseList = new ArrayList<>();
        try {
            responseList = problemService.getAllProblems();
        } catch (Exception e) {
            return new ResponseEntity<>("Problem not found.",HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(responseList,HttpStatus.OK);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getAll(@PathVariable String id) {
        ProblemResponse problemResponse;
        try {
            problemResponse = problemService.getProblemById(id);
        } catch (Exception e) {
            return new ResponseEntity<>("Problem not found.",HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(problemResponse,HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            problemService.deleteProblemById(id);
        } catch (Exception e) {
            return new ResponseEntity<>("Problem not found.",HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>("Deleted",HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@RequestBody ProblemRequest problemRequest,@PathVariable String id) {
        ProblemResponse problemResponse;
        try {
            problemResponse = problemService.updateProblem(problemRequest,id);
        } catch (Exception e) {
            return new ResponseEntity<>("Problem not found.",HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(problemResponse,HttpStatus.OK);
    }
}
