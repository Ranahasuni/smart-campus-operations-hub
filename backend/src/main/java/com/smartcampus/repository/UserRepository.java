package com.smartcampus.repository;

import com.smartcampus.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByCampusEmail(String campusEmail);
    Optional<User> findByCampusId(String campusId);
    List<User> findByRole(com.smartcampus.model.Role role);
    long countByStatus(com.smartcampus.model.UserStatus status);

    // ⚡ PERFORMANCE FIX: Fetch only name and role for enrichment
    @org.springframework.data.mongodb.repository.Query(value = "{ '_id': { $in: ?0 } }", fields = "{ 'id': 1, 'fullName': 1, 'role': 1 }")
    List<User> findMinimalByIds(java.util.Collection<String> ids);
}
