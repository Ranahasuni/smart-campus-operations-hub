package com.smartcampus.service;

import com.smartcampus.model.User;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service to handle User management operations for Administrators.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    public User updateUser(String id, User updatedUser, String adminId) {
        User existing = getUserById(id);
        
        if (updatedUser.getFullName() != null) existing.setFullName(updatedUser.getFullName());
        if (updatedUser.getRole() != null)     existing.setRole(updatedUser.getRole());
        if (updatedUser.getCampusId() != null) existing.setCampusId(updatedUser.getCampusId());
        
        User saved = userRepository.save(existing);
        auditService.log(adminId, "USER_UPDATE", "Updated user profile: " + existing.getCampusId() + " (ADMIN: " + adminId + ")");
        return saved;
    }

    public void updateUserStatus(String id, UserStatus status, String adminId) {
        User user = getUserById(id);
        UserStatus oldStatus = user.getStatus();
        user.setStatus(status);
        
        // If unlocking, reset failed attempts
        if (status == UserStatus.ACTIVE && oldStatus == UserStatus.LOCKED) {
            user.setFailedAttempts(0);
        }
        
        userRepository.save(user);
        auditService.log(adminId, "USER_STATUS_CHANGE", "Changed status of " + user.getCampusId() + " to " + status);
    }

    public void deleteUser(String id, String adminId) {
        User user = getUserById(id);
        userRepository.deleteById(id);
        auditService.log(adminId, "USER_DELETE", "Permanently deleted user: " + user.getCampusId());
    }
}
