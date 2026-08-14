package com.itsm.notification.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                if (jwtUtils.isTokenValid(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                    Long userId = jwtUtils.extractUserId(token);
                    List<String> roles = jwtUtils.extractRoles(token);
                    var authorities = roles.stream().map(SimpleGrantedAuthority::new).toList();
                    // Principal is the userID (Long) rather than a User entity, since this
                    // service does not own the User table - controllers use
                    // @AuthenticationPrincipal Long userID instead of the old User object.
                    var authToken = new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception ignored) {
                // invalid/expired token -> request proceeds unauthenticated and will be rejected downstream
            }
        }
        filterChain.doFilter(request, response);
    }
}
