package com.smartcampus.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        
        // DEBUG LOGGING
        if (authHeader != null) {
            System.out.println("DEBUG: Incoming Header -> " + authHeader.substring(0, Math.min(authHeader.length(), 40)) + "...");
        }

        // Skip if no Bearer token present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String username;

        try {
            username = jwtUtil.extractUsername(jwt);
            System.out.println("Extracted username from token: " + username);
        } catch (Exception e) {
            System.out.println("Failed to extract username from token: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        // Only authenticate if not already authenticated
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Determine if token is expired before any further checks
                if (jwtUtil.isTokenExpiredDirectly(jwt)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // ⚡ PERFORMANCE OPTIMIZATION: Extracting role and ID directly from JWT
                // This eliminates the mandatory database lookup on EVERY single request
                String role = jwtUtil.extractRole(jwt);
                String userId = jwtUtil.extractUserId(jwt);

                if (role != null) {
                    var authorities = java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));
                    
                    // Construct minimalist UserDetails without hitting DB
                    org.springframework.security.core.userdetails.User principal = 
                        new org.springframework.security.core.userdetails.User(username, "", authorities);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    principal,
                                    null,
                                    authorities
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                System.out.println("Stateless authentication error: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
