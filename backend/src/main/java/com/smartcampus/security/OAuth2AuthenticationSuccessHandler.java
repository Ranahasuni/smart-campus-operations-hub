package com.smartcampus.security;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.model.UserStatus;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Handles the redirect after a successful Google OAuth2 login.
 * Only @my.sliit.lk student emails are allowed.
 *
 * Flow:
 *  1. Google authenticates the student and Spring receives the OAuth2User.
 *  2. This handler finds or creates the user in MongoDB.
 *  3. A JWT is generated and the user is redirected to the frontend
 *     callback page with token + user info as query parameters.
 *
 * Security note:
 *   Google Auth is used only to verify the student's Google identity.
 *   The system still controls authorization by checking the email domain
 *   and assigning the STUDENT role from our backend.
 */
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url}")
    private String frontendUrl;

    private String getFrontendCallback() {
        return frontendUrl + "/oauth2/callback";
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Google OIDC standard claims
        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String picture  = oAuth2User.getAttribute("picture");

        // ── Null email guard ────────────────────────────────────────────
        if (email == null || email.isBlank()) {
            response.sendRedirect(getFrontendCallback() + "?error=" +
                    URLEncoder.encode("Google account has no email attribute", StandardCharsets.UTF_8));
            return;
        }

        // ── Domain Restriction ──────────────────────────────────────────
        // Only allow SLIIT student emails; reject personal Gmail, staff, etc.
        // Using endsWith is safer than parsing the domain substring.
        if (!email.endsWith("@my.sliit.lk")) {
            auditService.log(null, "OAUTH_DOMAIN_REJECTED",
                    "Google OAuth login rejected — non-SLIIT-student email: " + email);
            response.sendRedirect(getFrontendCallback() + "?error=" +
                    URLEncoder.encode(
                            "Access denied. Only SLIIT student emails (@my.sliit.lk) are allowed. " +
                            "Staff and admin should use Campus ID login.",
                            StandardCharsets.UTF_8));
            return;
        }

        // Google OAuth always assigns STUDENT role
        Role defaultRole = Role.STUDENT;

        // Find existing user by campus email, or create a new account
        User user = userRepository.findByCampusEmail(email).orElse(null);

        boolean isNewUser = false;
        if (user == null) {
            // Auto-register with Google profile
            isNewUser = true;
            user = User.builder()
                    .campusEmail(email)
                    .fullName(name != null ? name : email.split("@")[0])
                    .campusId("G-" + googleId.substring(0, Math.min(googleId.length(), 10)))
                    .password(null) // OAuth users don't have a local password
                    .role(defaultRole)
                    .status(UserStatus.ACTIVE)
                    .failedAttempts(0)
                    .lastLogin(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
            auditService.log(user.getId(), "OAUTH_REGISTER",
                    "New student auto-registered via Google OAuth: " + email + " [SOURCE: GOOGLE]");
        } else {
            // Check account status
            if (user.getStatus() == UserStatus.LOCKED) {
                response.sendRedirect(getFrontendCallback() + "?error=" +
                        URLEncoder.encode("Your account is LOCKED. Contact an Administrator.", StandardCharsets.UTF_8));
                return;
            }
            if (user.getStatus() == UserStatus.DISABLED) {
                response.sendRedirect(getFrontendCallback() + "?error=" +
                        URLEncoder.encode("Your account is DISABLED. Contact Support.", StandardCharsets.UTF_8));
                return;
            }

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            user.setFailedAttempts(0);
            userRepository.save(user);
        }

        // Generate JWT
        org.springframework.security.core.userdetails.UserDetails userDetails =
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getCampusId())
                        .password("")
                        .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                        .build();

        String token = jwtUtil.generateToken(userDetails, user.getRole().name(), user.getId());

        auditService.log(user.getId(), "OAUTH_LOGIN",
                "Google OAuth login successful for: " + email + " [SOURCE: GOOGLE]");

        // Redirect to frontend with token and user info
        String redirectUrl = getFrontendCallback()
                + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&id=" + URLEncoder.encode(user.getId(), StandardCharsets.UTF_8)
                + "&fullName=" + URLEncoder.encode(user.getFullName(), StandardCharsets.UTF_8)
                + "&campusEmail=" + URLEncoder.encode(user.getCampusEmail(), StandardCharsets.UTF_8)
                + "&role=" + URLEncoder.encode(user.getRole().name(), StandardCharsets.UTF_8)
                + "&campusId=" + URLEncoder.encode(user.getCampusId(), StandardCharsets.UTF_8)
                + "&newUser=" + isNewUser;

        response.sendRedirect(redirectUrl);
    }
}
