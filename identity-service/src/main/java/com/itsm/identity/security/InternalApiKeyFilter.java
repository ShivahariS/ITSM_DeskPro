package com.itsm.identity.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Guards the /api/internal/** endpoints that are only meant to be called by other
 * microservices in this system (e.g. incident-problem-service resolving user IDs by role).
 * These endpoints are never called by the frontend and are NOT protected by the normal
 * JWT filter, so a shared secret header is required instead.
 *
 * In a production deployment this would typically be replaced or complemented by network-level
 * isolation (private subnet / service mesh mTLS) rather than a static shared key.
 */
@Component
public class InternalApiKeyFilter extends OncePerRequestFilter {

    @Value("${app.internal.api-key}")
    private String internalApiKey;

    private static final String HEADER = "X-Internal-Api-Key";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api/internal/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String provided = request.getHeader(HEADER);
        if (provided == null || !provided.equals(internalApiKey)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Missing or invalid internal API key\"}");
            return;
        }

        var authorities = List.of(new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE"));
        var authToken = new UsernamePasswordAuthenticationToken("internal-service", null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
