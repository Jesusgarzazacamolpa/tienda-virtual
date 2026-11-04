package com.agencia.backoffice.common.web;

import com.agencia.backoffice.common.error.TraceIdResolver;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class TraceIdResponseFilter extends OncePerRequestFilter {

    private final TraceIdResolver traceIdResolver;

    public TraceIdResponseFilter(TraceIdResolver traceIdResolver) {
        this.traceIdResolver = traceIdResolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Se fija antes del resto de la cadena para que sobreviva si la respuesta se confirma.
        String traceId = traceIdResolver.currentTraceId();
        if (traceId != null) {
            response.setHeader(TraceHeaders.TRACE_ID, traceId);
        }
        filterChain.doFilter(request, response);
    }
}
