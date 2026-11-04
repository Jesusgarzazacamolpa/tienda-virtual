package com.agencia.backoffice.report;

import com.agencia.backoffice.common.error.GlobalExceptionHandler;
import com.agencia.backoffice.common.error.TraceIdResolver;
import io.micrometer.tracing.Tracer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ReportControllerTest {

    private static final String TRACE_ID = "test-trace-id";

    private MockMvc mvc;
    private ReportService reportService;

    @BeforeEach
    void setUp() {
        reportService = mock(ReportService.class);
        mvc = MockMvcBuilders.standaloneSetup(new ReportController(reportService))
                .setControllerAdvice(new GlobalExceptionHandler(new TraceIdResolver(mock(Tracer.class))))
                .build();
        MDC.put("traceId", TRACE_ID);
    }

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    void listsCatalog() throws Exception {
        when(reportService.catalog()).thenReturn(List.of(new ReportDefinition(
                "users", "Usuarios", "Listado de usuarios.", List.of("pdf", "xlsx"))));

        mvc.perform(get("/api/v1/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("users"))
                .andExpect(jsonPath("$[0].title").value("Usuarios"))
                .andExpect(jsonPath("$[0].formats[1]").value("xlsx"));
    }

    @Test
    void downloadsPdfWithAttachmentHeaders() throws Exception {
        byte[] body = "%PDF-1.7".getBytes(StandardCharsets.US_ASCII);
        when(reportService.generate(eq("users"), eq(ReportFormat.PDF), eq("ana"), eq("admin@test.com")))
                .thenReturn(new ReportFile("usuarios-20260101-1200.pdf", "application/pdf", body));

        mvc.perform(get("/api/v1/reports/users")
                        .param("format", "pdf")
                        .param("search", "ana")
                        .principal(new UsernamePasswordAuthenticationToken("admin@test.com", null)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                        containsString("usuarios-20260101-1200.pdf")))
                .andExpect(content().bytes(body));
    }

    @Test
    void rejectsUnsupportedFormat() throws Exception {
        mvc.perform(get("/api/v1/reports/users").param("format", "docx"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-002"))
                .andExpect(jsonPath("$.message").value("El formato solicitado no es válido. Usa pdf o xlsx."))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID));

        verify(reportService, never()).generate(any(), any(), any(), any());
    }

    @Test
    void propagatesUnknownReportAsNotFound() throws Exception {
        when(reportService.generate(eq("invoices"), any(), any(), any()))
                .thenThrow(new com.agencia.backoffice.common.error.ApiException(
                        com.agencia.backoffice.common.error.FlowCode.NOT_FOUND,
                        "El reporte solicitado no existe."));

        mvc.perform(get("/api/v1/reports/invoices")
                        .principal(new UsernamePasswordAuthenticationToken("admin@test.com", null)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.flowCode").value("RES-001"));
    }
}
