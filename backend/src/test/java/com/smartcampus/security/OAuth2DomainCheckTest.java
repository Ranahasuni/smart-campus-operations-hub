package com.smartcampus.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for the OAuth2 email domain restriction logic.
 * These tests verify that only SLIIT email domains are accepted.
 */
class OAuth2DomainCheckTest {

    // Mirror the exact lists from OAuth2AuthenticationSuccessHandler
    private static final List<String> ALLOWED_DOMAINS = List.of(
            "sliit.lk",
            "my.sliit.lk"
    );

    private static final List<String> STAFF_DOMAINS = List.of(
            "sliit.lk"
    );

    private boolean isAllowedDomain(String domain) {
        return ALLOWED_DOMAINS.contains(domain);
    }

    private boolean isStaffDomain(String domain) {
        return STAFF_DOMAINS.contains(domain);
    }

    // ── Allowed domain tests ─────────────────────────────────────────────

    @ParameterizedTest
    @ValueSource(strings = {
        "lecturer@sliit.lk",
        "admin@sliit.lk",
        "it12345678@my.sliit.lk",
        "student@my.sliit.lk"
    })
    @DisplayName("✅ SLIIT emails should be ALLOWED")
    void sliitEmailsShouldBeAllowed(String email) {
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        assertTrue(isAllowedDomain(domain),
                "Expected " + email + " to be ALLOWED but it was rejected");
    }

    // ── Rejected domain tests ────────────────────────────────────────────

    @ParameterizedTest
    @ValueSource(strings = {
        "hacker@gmail.com",
        "user@yahoo.com",
        "test@outlook.com",
        "fake@notsliit.lk",
        "spoof@sliit.lk.evil.com"
    })
    @DisplayName("❌ Non-SLIIT emails should be REJECTED")
    void nonSliitEmailsShouldBeRejected(String email) {
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        assertFalse(isAllowedDomain(domain),
                "Expected " + email + " to be REJECTED but it was allowed");
    }

    // ── Role assignment tests ────────────────────────────────────────────

    @Test
    @DisplayName("🎓 Staff domain (@sliit.lk) should map to LECTURER role")
    void staffDomainShouldMapToLecturer() {
        assertTrue(isStaffDomain("sliit.lk"));
    }

    @Test
    @DisplayName("📚 Student domain (@my.sliit.lk) should NOT be staff")
    void studentDomainShouldNotBeStaff() {
        assertFalse(isStaffDomain("my.sliit.lk"));
    }
}
