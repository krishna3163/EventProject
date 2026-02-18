package com.company.event.organization;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends MongoRepository<Organization, String> {
    Optional<Organization> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
