package com.company.event.contestPackage.problem;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends MongoRepository<Problem, String> {
    List<Problem> findByOrganizationId(String organizationId);
}
