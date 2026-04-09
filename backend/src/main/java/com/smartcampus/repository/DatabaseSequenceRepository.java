package com.smartcampus.repository;

import com.smartcampus.model.DatabaseSequence;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DatabaseSequenceRepository extends MongoRepository<DatabaseSequence, String> {
}
