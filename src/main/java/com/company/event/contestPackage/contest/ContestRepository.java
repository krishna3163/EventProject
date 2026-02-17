package com.company.event.contestPackage.contest;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ContestRepository extends MongoRepository<Contest,String> {

}
