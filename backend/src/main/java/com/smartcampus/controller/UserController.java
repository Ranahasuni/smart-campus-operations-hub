package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    /** Get the currently authenticated user's profile */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByCampusId(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userDetails.getUsername()));

        return ResponseEntity.ok(Map.of(
                "id",          user.getId(),
                "fullName",    user.getFullName(),
                "campusEmail", user.getCampusEmail(),
                "role",        user.getRole().name(),
                "status",      user.getStatus().name(),
                "campusId",    user.getCampusId(),
                "lastLogin",   user.getLastLogin() != null ? user.getLastLogin().toString() : ""
        ));
    }

    /** Create a new user — ADMIN only */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<User> createUser(
            @RequestBody User newUser,
            @AuthenticationPrincipal UserDetails admin) {
        
        User adminObj = userRepository.findByCampusId(admin.getUsername())
                .orElseThrow(() -> new IllegalStateException("Admin not found"));
        
        return ResponseEntity.ok(userService.createUser(newUser, adminObj.getId()));
    }

    /** List all users — ADMIN only */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** List users by role — ADMIN only */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable com.smartcampus.model.Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    /** Get user details — ADMIN only */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /** Update user profile — ADMIN only here, or extended for profile self-service later */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<User> updateUser(
            @PathVariable String id, 
            @RequestBody User updatedUser,
            @AuthenticationPrincipal UserDetails admin) {
        
        // Get Admin ID from campusId for logging
        User adminObj = userRepository.findByCampusId(admin.getUsername())
                .orElseThrow(() -> new IllegalStateException("Admin not found"));
        
        return ResponseEntity.ok(userService.updateUser(id, updatedUser, adminObj.getId()));
    }

    /** Update user status (LOCKED / ACTIVE / DISABLED) — ADMIN only */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<Void> updateStatus(
            @PathVariable String id, 
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails admin) {
        
        User adminObj = userRepository.findByCampusId(admin.getUsername())
                .orElseThrow(() -> new IllegalStateException("Admin not found"));
        
        UserStatus status = UserStatus.valueOf(body.get("status"));
        userService.updateUserStatus(id, status, adminObj.getId());
        return ResponseEntity.ok().build();
    }

    /** Delete user — ADMIN only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails admin) {
        
        User adminObj = userRepository.findByCampusId(admin.getUsername())
                .orElseThrow(() -> new IllegalStateException("Admin not found"));
        
        userService.deleteUser(id, adminObj.getId());
        return ResponseEntity.noContent().build();
    }
}
