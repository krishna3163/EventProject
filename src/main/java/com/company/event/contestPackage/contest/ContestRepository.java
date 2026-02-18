package com.company.event.contestPackage.contest;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ContestRepository extends MongoRepository<Contest, String> {
    List<Contest> findByOrganizationId(String organizationId);
}
