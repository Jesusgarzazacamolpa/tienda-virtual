package com.agencia.backoffice.common.error;

import com.agencia.backoffice.common.web.TraceHeaders;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class ApiErrorWriter {

    private static final Logger log = LoggerFactory.getLogger(ApiErrorWriter.class);

    private final ObjectMapper objectMapper;
    private final TraceIdResolver traceIdResolver;

    public ApiErrorWriter(ObjectMapper objectMapper, TraceIdResolver traceIdResolver) {
        this.objectMapper = objectMapper;
        this.traceIdResolver = traceIdResolver;
    }

    public void write(HttpServletRequest request, HttpServletResponse response, FlowCode flowCode)
            throws IOException {
        String traceId = traceIdResolver.currentTraceId();
        log.warn("flowCode={} method={} path={}", flowCode.code(), request.getMethod(),
                request.getRequestURI());
        response.setStatus(flowCode.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        if (traceId != null) {
            response.setHeader(TraceHeaders.TRACE_ID, traceId);
        }
        ApiErrorResponse body = ApiErrorResponse.from(flowCode, flowCode.message(), traceId, List.of());
        objectMapper.writeValue(response.getWriter(), body);
    }
}
