package com.hotelbooking.roombooking.util;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(1)
public class RateLimitingFilter implements Filter {
    private static final Logger logger = LoggerFactory.getLogger(RateLimitingFilter.class);

    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private final Map<String, AtomicInteger> ipRequestMap = new ConcurrentHashMap<>();
    private final Map<String, Long> ipResetTimeMap = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String ip = httpRequest.getRemoteAddr();
        long now = System.currentTimeMillis();

        ipResetTimeMap.putIfAbsent(ip, now + 60000);
        long resetTime = ipResetTimeMap.get(ip);

        if (now > resetTime) {
            ipRequestMap.put(ip, new AtomicInteger(0));
            ipResetTimeMap.put(ip, now + 60000);
        }

        ipRequestMap.putIfAbsent(ip, new AtomicInteger(0));
        int requests = ipRequestMap.get(ip).incrementAndGet();

        if (requests > MAX_REQUESTS_PER_MINUTE) {
            logger.warn("Rate limit exceeded for IP: {}. Total requests in minute window: {}", ip, requests);
            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"status\": 429, \"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Please try again in a minute.\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
