package com.smartcampus.service;

import com.smartcampus.model.User;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public User createUser(User user, String adminId) {
        if (userRepository.findByCampusId(user.getCampusId()).isPresent()) {
            throw new IllegalArgumentException("Campus ID already exists: " + user.getCampusId());
        }
        if (userRepository.findByCampusEmail(user.getCampusEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + user.getCampusEmail());
        }

        // Set default values for admin-created accounts
        user.setStatus(UserStatus.ACTIVE);
        user.setFailedAttempts(0);
        
        // Hash the initial password if provided, else use a default or throw
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        User saved = userRepository.save(user);
        auditService.log(adminId, "USER_CREATE", "Admin created new account: " + user.getCampusId());
        return saved;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(com.smartcampus.model.Role role) {
        return userRepository.findByRole(role);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    public User updateUser(String id, User updatedUser, String adminId) {
        User existing = getUserById(id);
        
        // 1. Self-Demotion Prevention
        if (id.equals(adminId) && updatedUser.getRole() != null && updatedUser.getRole() != com.smartcampus.model.Role.ADMIN) {
            throw new IllegalStateException("Security Violation: You cannot demote yourself. Another Administrator must perform this action.");
        }

        // 2. Last Admin Protection (for Role changes)
        if (existing.getRole() == com.smartcampus.model.Role.ADMIN && updatedUser.getRole() != null && updatedUser.getRole() != com.smartcampus.model.Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == com.smartcampus.model.Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new IllegalStateException("Security Violation: Cannot demote the only remaining Administrator. Create another Admin first.");
            }
        }

        if (updatedUser.getFullName() != null) existing.setFullName(updatedUser.getFullName());
        if (updatedUser.getRole() != null)     existing.setRole(updatedUser.getRole());
        if (updatedUser.getCampusId() != null) existing.setCampusId(updatedUser.getCampusId());
        
        User saved = userRepository.save(existing);
        auditService.log(adminId, "USER_UPDATE", "Updated user profile: " + existing.getCampusId() + " (ADMIN: " + adminId + ")");
        return saved;
    }

    public void updateUserStatus(String id, UserStatus status, String adminId) {
        User user = getUserById(id);
        
        // 3. Last Admin Protection (for Deactivation)
        if (id.equals(adminId) && status != UserStatus.ACTIVE) {
            throw new IllegalStateException("Security Violation: You cannot deactivate or lock your own account.");
        }

        UserStatus oldStatus = user.getStatus();
        user.setStatus(status);
        
        // If unlocking, reset failed attempts
        if (status == UserStatus.ACTIVE && oldStatus == UserStatus.LOCKED) {
            user.setFailedAttempts(0);
        }
        
        userRepository.save(user);
        auditService.log(adminId, "USER_STATUS_CHANGE", "Changed status of " + user.getCampusId() + " to " + status);

        // Security Tracking: Notify other admins about this action
        if (status != UserStatus.ACTIVE || oldStatus != UserStatus.ACTIVE) {
            notificationService.notifyAdmins(
                "Security Update: " + user.getCampusId(),
                "Account status changed to " + status + " by Administrator.",
                com.smartcampus.model.NotificationType.SYSTEM,
                com.smartcampus.model.NotificationPriority.MEDIUM
            );
        }
    }

    public void deleteUser(String id, String adminId) {
        User user = getUserById(id);
        
        // 4. Last Admin Protection (for Deletion)
        if (user.getRole() == com.smartcampus.model.Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == com.smartcampus.model.Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new IllegalStateException("Security Violation: Cannot delete the only remaining Administrator.");
            }
        }

        userRepository.deleteById(id);
        auditService.log(adminId, "USER_DELETE", "Permanently deleted user: " + user.getCampusId());
    }
}
