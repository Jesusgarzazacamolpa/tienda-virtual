package com.agencia.backoffice.lead;

import com.agencia.backoffice.common.error.GlobalExceptionHandler;
import com.agencia.backoffice.common.error.TraceIdResolver;
import com.agencia.backoffice.lead.dto.CreateLeadRequest;
import com.agencia.backoffice.lead.dto.LeadResponse;
import io.micrometer.tracing.Tracer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class LeadControllerTest {

    private static final String TRACE_ID = "test-trace-id";

    private MockMvc mvc;
    private LocalValidatorFactoryBean validator;
    private LeadService leadService;

    @BeforeEach
    void setUp() {
        leadService = mock(LeadService.class);
        validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mvc = MockMvcBuilders.standaloneSetup(new LeadController(leadService))
                .setControllerAdvice(new GlobalExceptionHandler(new TraceIdResolver(mock(Tracer.class))))
                .setValidator(validator)
                .build();

        MDC.put("traceId", TRACE_ID);
    }

    @AfterEach
    void tearDown() {
        MDC.clear();
        validator.close();
    }

    @Test
    void registersLead() throws Exception {
        UUID id = UUID.randomUUID();
        when(leadService.create(any(CreateLeadRequest.class)))
                .thenReturn(Optional.of(new LeadResponse(id, Instant.now())));

        mvc.perform(post("/api/v1/leads")
                        .contentType(APPLICATION_JSON)
                        .content("{\"fullName\":\"Ana López\",\"email\":\"ana@empresa.com\","
                                + "\"company\":\"Corporativo del Bajío\",\"challenge\":\"MODERNIZATION\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id.toString()));
    }

    @Test
    void validatesRequiredFields() throws Exception {
        mvc.perform(post("/api/v1/leads")
                        .contentType(APPLICATION_JSON)
                        .content("{\"fullName\":\"\",\"email\":\"no-es-correo\",\"company\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-001"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID))
                .andExpect(jsonPath("$.details[?(@.field == 'fullName')]").exists())
                .andExpect(jsonPath("$.details[?(@.field == 'email')]").exists())
                .andExpect(jsonPath("$.details[?(@.field == 'company')]").exists())
                .andExpect(jsonPath("$.details[?(@.field == 'challenge')]").exists());

        verify(leadService, never()).create(any());
    }

    @Test
    void discardsHoneypotSubmission() throws Exception {
        when(leadService.create(any(CreateLeadRequest.class))).thenReturn(Optional.empty());

        mvc.perform(post("/api/v1/leads")
                        .contentType(APPLICATION_JSON)
                        .content("{\"fullName\":\"Bot\",\"email\":\"bot@spam.com\","
                                + "\"company\":\"Spam\",\"challenge\":\"INTEGRATIONS\",\"website\":\"http://spam\"}"))
                .andExpect(status().isAccepted());
    }

    @Test
    void rejectsUnknownChallenge() throws Exception {
        mvc.perform(post("/api/v1/leads")
                        .contentType(APPLICATION_JSON)
                        .content("{\"fullName\":\"Ana\",\"email\":\"ana@empresa.com\","
                                + "\"company\":\"Empresa\",\"challenge\":\"OTRO\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-002"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID));

        verify(leadService, never()).create(any());
    }
}
