package com.agencia.backoffice.common.web;

import com.agencia.backoffice.common.error.TraceIdResolver;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TraceIdResponseFilterTest {

    private final TraceIdResolver traceIdResolver = mock(TraceIdResolver.class);
    private final TraceIdResponseFilter filter = new TraceIdResponseFilter(traceIdResolver);

    @Test
    void writesTraceIdBeforeContinuingTheChain() throws Exception {
        when(traceIdResolver.currentTraceId()).thenReturn("trace-abc");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicReference<String> headerSeenByChain = new AtomicReference<>();

        FilterChain chain = (request, chainResponse) ->
                headerSeenByChain.set(((MockHttpServletResponse) chainResponse)
                        .getHeader(TraceHeaders.TRACE_ID));

        filter.doFilter(new MockHttpServletRequest(), response, chain);

        assertThat(headerSeenByChain).hasValue("trace-abc");
        assertThat(response.getHeader(TraceHeaders.TRACE_ID)).isEqualTo("trace-abc");
    }

    @Test
    void omitsHeaderWhenThereIsNoActiveTrace() throws Exception {
        when(traceIdResolver.currentTraceId()).thenReturn(null);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(new MockHttpServletRequest(), response, new MockFilterChain());

        assertThat(response.getHeader(TraceHeaders.TRACE_ID)).isNull();
    }
}
