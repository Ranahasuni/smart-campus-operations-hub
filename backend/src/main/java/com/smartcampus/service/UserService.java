package com.smartcampus.service;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository, 
                       AuditService auditService, 
                       PasswordEncoder passwordEncoder, 
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    public User createUser(User user, String adminId) {
        if (userRepository.findByCampusId(user.getCampusId()).isPresent()) {
            throw new IllegalArgumentException("Campus ID already exists: " + user.getCampusId());
        }
        if (userRepository.findByCampusEmail(user.getCampusEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + user.getCampusEmail());
        }

        // Security Validation
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Security Violation: Direct creation of ADMINs is restricted.");
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setFailedAttempts(0);
        
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        User saved = userRepository.save(user);
        auditService.log(adminId, "USER_CREATE", "Admin created account: " + user.getCampusId());
        return saved;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    public User updateUser(String id, User updatedUser, String adminId) {
        User existing = getUserById(id);
        
        if (updatedUser.getRole() == Role.ADMIN && existing.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Security Violation: Promotion to ADMIN is restricted.");
        }

        if (existing.getRole() == Role.ADMIN && updatedUser.getRole() != null && updatedUser.getRole() != Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new IllegalStateException("Security Violation: Cannot demote the only remaining Administrator.");
            }
        }

        if (updatedUser.getFullName() != null) existing.setFullName(updatedUser.getFullName());
        if (updatedUser.getRole() != null)     existing.setRole(updatedUser.getRole());
        
        User saved = userRepository.save(existing);
        auditService.log(adminId, "USER_UPDATE", "Updated user: " + existing.getCampusId());
        return saved;
    }

    public void updateUserStatus(String id, UserStatus status, String adminId) {
        User user = getUserById(id);
        
        // 1. Last Admin Strategy
        if (user.getRole() == Role.ADMIN && status != UserStatus.ACTIVE) {
            long activeAdmins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN && u.getStatus() == UserStatus.ACTIVE).count();
            if (activeAdmins <= 1 && id.equals(adminId)) {
                throw new IllegalStateException("Security Violation: Cannot lock the only active Administrator.");
            }
        }

        UserStatus oldStatus = user.getStatus();
        user.setStatus(status);
        
        // 2. Clear lockout if Admin intervenes
        if (status == UserStatus.ACTIVE) {
            user.setFailedAttempts(0);
            user.setLockoutUntil(null);
        }
        
        userRepository.save(user);
        auditService.log(adminId, "USER_STATUS_CHANGE", "Status of " + user.getCampusId() + " -> " + status);

        if (status != UserStatus.ACTIVE || oldStatus != UserStatus.ACTIVE) {
            notificationService.notifyAdmins(
                "System: Account Status Change",
                "User " + user.getCampusId() + " is now " + status,
                com.smartcampus.model.NotificationType.SYSTEM,
                com.smartcampus.model.NotificationPriority.MEDIUM
            );
        }
    }

    public void deleteUser(String id, String adminId) {
        User user = getUserById(id);
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new IllegalStateException("Security Violation: Cannot delete the only remaining Admin.");
            }
        }
        userRepository.deleteById(id);
        auditService.log(adminId, "USER_DELETE", "Deleted user: " + user.getCampusId());
    }
}
