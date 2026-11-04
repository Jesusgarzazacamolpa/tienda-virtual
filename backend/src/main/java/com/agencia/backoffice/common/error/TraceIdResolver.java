package com.agencia.backoffice.common.error;

import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

@Component
public class TraceIdResolver {

    private final Tracer tracer;

    public TraceIdResolver(Tracer tracer) {
        this.tracer = tracer;
    }

    public String currentTraceId() {
        Span span = tracer.currentSpan();
        return span != null ? span.context().traceId() : MDC.get("traceId");
    }
}
