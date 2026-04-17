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
 * Handles the redirect after a successful Microsoft (Azure AD) OAuth2 login.
 *
 * Flow:
 *  1. Microsoft authenticates the user and Spring receives the OAuth2User.
 *  2. This handler finds or creates the user in MongoDB.
 *  3. A JWT is generated and the user is redirected to the frontend
 *     callback page with token + user info as query parameters.
 */
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    private static final String FRONTEND_CALLBACK = "http://localhost:5173/oauth2/callback";

    /**
     * Allowed email domains for OAuth2 sign-in.
     * Only users with these email domains can authenticate via SLIIT Microsoft.
     */
    private static final List<String> ALLOWED_DOMAINS = List.of(
            "sliit.lk",
            "my.sliit.lk"
    );

    /** Staff/faculty domains that auto-assign the LECTURER role */
    private static final List<String> STAFF_DOMAINS = List.of(
            "sliit.lk"
    );

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Microsoft standard OIDC claims
        String email = oAuth2User.getAttribute("email") != null 
                ? oAuth2User.getAttribute("email") 
                : oAuth2User.getAttribute("preferred_username");
        
        String name  = oAuth2User.getAttribute("name");
        
        // Azure AD unique Object ID (preferred) or standard sub
        String msalId = oAuth2User.getAttribute("oid") != null 
                ? oAuth2User.getAttribute("oid") 
                : oAuth2User.getAttribute("sub"); 

        if (email == null || email.isBlank()) {
            response.sendRedirect(FRONTEND_CALLBACK + "?error=" +
                    URLEncoder.encode("Microsoft account has no email attribute", StandardCharsets.UTF_8));
            return;
        }

        // ── Domain Restriction ──────────────────────────────────────────
        // Only allow campus email addresses; reject personal Gmail, etc.
        String emailDomain = email.substring(email.indexOf('@') + 1).toLowerCase();
        if (!isAllowedDomain(emailDomain)) {
            auditService.log(null, "OAUTH_DOMAIN_REJECTED",
                    "Microsoft OAuth login rejected — non-campus email: " + email);
            response.sendRedirect(FRONTEND_CALLBACK + "?error=" +
                    URLEncoder.encode(
                            "Access denied. Only SLIIT email addresses (@sliit.lk / @my.sliit.lk) are permitted. " +
                            "Please sign in with your campus email.",
                            StandardCharsets.UTF_8));
            return;
        }

        // Determine default role based on email domain
        Role defaultRole = isStaffDomain(emailDomain) ? Role.LECTURER : Role.STUDENT;

        // Find existing user by campus email, or create a new account
        User user = userRepository.findByCampusEmail(email).orElse(null);

        boolean isNewUser = false;
        if (user == null) {
            // Auto-register with Microsoft profile
            isNewUser = true;
            user = User.builder()
                    .campusEmail(email)
                    .fullName(name != null ? name : email.split("@")[0])
                    .campusId("M-" + msalId.substring(0, Math.min(msalId.length(), 10)))
                    .password(null) // OAuth users don't have a local password
                    .role(defaultRole)
                    .status(UserStatus.ACTIVE)
                    .failedAttempts(0)
                    .lastLogin(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
            auditService.log(user.getId(), "OAUTH_REGISTER",
                    "New user auto-registered via Microsoft OAuth: " + email);
        } else {
            // Check account status
            if (user.getStatus() == UserStatus.LOCKED) {
                response.sendRedirect(FRONTEND_CALLBACK + "?error=" +
                        URLEncoder.encode("Your account is LOCKED. Contact an Administrator.", StandardCharsets.UTF_8));
                return;
            }
            if (user.getStatus() == UserStatus.DISABLED) {
                response.sendRedirect(FRONTEND_CALLBACK + "?error=" +
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
                "Microsoft OAuth login successful for: " + email);

        // Redirect to frontend with token and user info
        String redirectUrl = FRONTEND_CALLBACK
                + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&id=" + URLEncoder.encode(user.getId(), StandardCharsets.UTF_8)
                + "&fullName=" + URLEncoder.encode(user.getFullName(), StandardCharsets.UTF_8)
                + "&campusEmail=" + URLEncoder.encode(user.getCampusEmail(), StandardCharsets.UTF_8)
                + "&role=" + URLEncoder.encode(user.getRole().name(), StandardCharsets.UTF_8)
                + "&campusId=" + URLEncoder.encode(user.getCampusId(), StandardCharsets.UTF_8)
                + "&newUser=" + isNewUser;

        response.sendRedirect(redirectUrl);
    }

    // ── Domain Helpers ──────────────────────────────────────────────────────

    /** Check if the email domain matches any allowed campus domain */
    private boolean isAllowedDomain(String domain) {
        return ALLOWED_DOMAINS.contains(domain);
    }

    /** Check if the email domain belongs to staff/faculty */
    private boolean isStaffDomain(String domain) {
        return STAFF_DOMAINS.contains(domain);
    }
}
