package com.Workpedia.Groovely.config;


import com.Workpedia.Groovely.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException{
        try{
            String token = extractToken(request);
            if (token != null && jwtUtil.validateToken(token)) {
                String walletAddress = jwtUtil.getWalletAddressFromToken(token);

                userRepository.findByWalletAddress(walletAddress).ifPresent(user -> {
                    var auth = new UsernamePasswordAuthenticationToken( walletAddress, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );

                    SecurityContextHolder.getContext().setAuthentication(auth);

                });
            }
        } catch (Exception e){
            log.error("Auth filter error: {}",e.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request){
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
