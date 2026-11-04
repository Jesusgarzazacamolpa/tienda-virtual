package com.agencia.backoffice.common.error;

import io.micrometer.tracing.Tracer;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.http.MediaType.TEXT_PLAIN;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private static final String TRACE_ID = "test-trace-id";

    private MockMvc mvc;
    private LocalValidatorFactoryBean validator;

    @BeforeEach
    void setUp() {
        validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        Tracer tracer = mock(Tracer.class);
        mvc = MockMvcBuilders.standaloneSetup(new ProbeController())
                .setControllerAdvice(new GlobalExceptionHandler(new TraceIdResolver(tracer)))
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
    void mapsApiExceptionToFlowCodeAndTraceId() throws Exception {
        mvc.perform(get("/probe/missing"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.flowCode").value("RES-001"))
                .andExpect(jsonPath("$.message").value(FlowCode.NOT_FOUND.message()))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void mapsValidationErrorsWithFieldDetails() throws Exception {
        mvc.perform(post("/probe/validate")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-001"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID))
                .andExpect(jsonPath("$.details[0].field").value("email"))
                .andExpect(jsonPath("$.details[0].message").value("El correo es obligatorio."));
    }

    @Test
    void mapsMalformedJsonToInvalidRequest() throws Exception {
        mvc.perform(post("/probe/validate")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-002"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID));
    }

    @Test
    void mapsMalformedPathVariableToInvalidRequest() throws Exception {
        mvc.perform(get("/probe/items/not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-002"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID));
    }

    @Test
    void mapsUnsupportedMethodToMethodNotAllowed() throws Exception {
        mvc.perform(post("/probe/missing"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.flowCode").value("VAL-003"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID));
    }

    @Test
    void mapsUnsupportedMediaTypeToInvalidRequest() throws Exception {
        mvc.perform(post("/probe/validate")
                        .contentType(TEXT_PLAIN)
                        .content("correo"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-002"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID));
    }

    @Test
    void mapsDataIntegrityViolationToConflict() throws Exception {
        mvc.perform(get("/probe/conflict"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.flowCode").value("RES-002"))
                .andExpect(jsonPath("$.message").value(FlowCode.CONFLICT.message()))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID));
    }

    @Test
    void hidesUnexpectedExceptionDetailsButKeepsTraceId() throws Exception {
        String body = mvc.perform(get("/probe/boom"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.flowCode").value("GEN-500"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID))
                .andReturn()
                .getResponse()
                .getContentAsString();

        assertThat(body)
                .doesNotContain("super-secret-value")
                .doesNotContain("IllegalStateException");
    }

    @RestController
    static class ProbeController {

        @GetMapping("/probe/missing")
        void missing() {
            throw new ApiException(FlowCode.NOT_FOUND);
        }

        @GetMapping("/probe/items/{id}")
        void item(@PathVariable UUID id) {
        }

        @GetMapping("/probe/boom")
        void boom() {
            throw new IllegalStateException("super-secret-value");
        }

        @GetMapping("/probe/conflict")
        void conflict() {
            throw new DataIntegrityViolationException("duplicate key value violates unique constraint");
        }

        @PostMapping("/probe/validate")
        void validate(@Valid @RequestBody Payload payload) {
        }

        record Payload(@NotBlank(message = "El correo es obligatorio.") String email) {
        }
    }
}
