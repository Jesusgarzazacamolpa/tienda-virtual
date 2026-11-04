package com.agencia.backoffice.auth;

import com.agencia.backoffice.auth.dto.AuthenticatedUser;
import com.agencia.backoffice.auth.dto.LoginResponse;
import com.agencia.backoffice.common.error.ApiException;
import com.agencia.backoffice.common.error.FlowCode;
import com.agencia.backoffice.common.error.GlobalExceptionHandler;
import com.agencia.backoffice.common.error.TraceIdResolver;
import io.micrometer.tracing.Tracer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private static final String TRACE_ID = "test-trace-id";

    private MockMvc mvc;
    private LocalValidatorFactoryBean validator;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mvc = MockMvcBuilders.standaloneSetup(new AuthController(authService))
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
    void returnsTokenForValidCredentials() throws Exception {
        AuthenticatedUser user = new AuthenticatedUser(
                UUID.randomUUID(), "user@test.com", "Test", "User", List.of("ADMIN", "USER"));
        when(authService.login(any()))
                .thenReturn(new LoginResponse("jwt-token", "Bearer", 3600L, user));

        mvc.perform(post("/api/v1/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"USER@test.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresInSeconds").value(3600))
                .andExpect(jsonPath("$.user.email").value("user@test.com"))
                .andExpect(jsonPath("$.user.roles[0]").value("ADMIN"))
                .andExpect(jsonPath("$.user.roles[1]").value("USER"));
    }

    @Test
    void returnsAuthFlowCodeForBadCredentials() throws Exception {
        when(authService.login(any()))
                .thenThrow(new ApiException(FlowCode.UNAUTHORIZED, "Credenciales inválidas."));

        mvc.perform(post("/api/v1/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"user@test.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.flowCode").value("AUTH-001"))
                .andExpect(jsonPath("$.message").value("Credenciales inválidas."))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID));
    }

    @Test
    void validatesRequestBody() throws Exception {
        mvc.perform(post("/api/v1/auth/login")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-001"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID))
                .andExpect(jsonPath("$.details[?(@.field == 'email')]").exists())
                .andExpect(jsonPath("$.details[?(@.field == 'password')]").exists());
    }
}
