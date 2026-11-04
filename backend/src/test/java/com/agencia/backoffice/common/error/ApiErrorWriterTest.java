package com.agencia.backoffice.common.error;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.agencia.backoffice.common.web.TraceHeaders;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ApiErrorWriterTest {

    private ListAppender<ILoggingEvent> logs;

    @BeforeEach
    void setUp() {
        logs = new ListAppender<>();
        logs.start();
        ((Logger) LoggerFactory.getLogger(ApiErrorWriter.class)).addAppender(logs);
    }

    @AfterEach
    void tearDown() {
        ((Logger) LoggerFactory.getLogger(ApiErrorWriter.class)).detachAppender(logs);
        logs.stop();
    }

    @Test
    void writesFlowCodeBodyTraceHeaderAndLog() throws Exception {
        TraceIdResolver traceIdResolver = mock(TraceIdResolver.class);
        when(traceIdResolver.currentTraceId()).thenReturn("trace-abc");
        ApiErrorWriter writer = new ApiErrorWriter(new ObjectMapper().findAndRegisterModules(), traceIdResolver);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/users");
        MockHttpServletResponse response = new MockHttpServletResponse();

        writer.write(request, response, FlowCode.UNAUTHORIZED);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getHeader(TraceHeaders.TRACE_ID)).isEqualTo("trace-abc");
        assertThat(response.getContentAsString())
                .contains("\"flowCode\":\"AUTH-001\"")
                .contains("\"traceId\":\"trace-abc\"");
        assertThat(logs.list).hasSize(1);
        assertThat(logs.list.getFirst().getFormattedMessage())
                .contains("flowCode=AUTH-001")
                .contains("method=GET")
                .contains("path=/api/v1/users");
    }
}
