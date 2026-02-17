package com.company.event.contestPackage.submission;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission,String> {

    List<Submission> findAllByUserId(String userId);

    List<Submission> findAllByContestId(String contestId);

    List<Submission> findAllByProblemId(String problemId);
}
