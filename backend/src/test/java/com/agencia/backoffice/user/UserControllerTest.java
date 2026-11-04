package com.agencia.backoffice.user;

import com.agencia.backoffice.auth.UserPrincipal;
import com.agencia.backoffice.common.error.GlobalExceptionHandler;
import com.agencia.backoffice.common.error.TraceIdResolver;
import com.agencia.backoffice.common.web.PageResponse;
import com.agencia.backoffice.user.dto.CreateUserRequest;
import com.agencia.backoffice.user.dto.UserResponse;
import io.micrometer.tracing.Tracer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserControllerTest {

    private static final String TRACE_ID = "test-trace-id";

    private MockMvc mvc;
    private LocalValidatorFactoryBean validator;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mvc = MockMvcBuilders.standaloneSetup(new UserController(userService))
                .setControllerAdvice(new GlobalExceptionHandler(new TraceIdResolver(mock(Tracer.class))))
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
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
    void listsUsersWithSearchAndPagination() throws Exception {
        UserResponse user = sampleUser(UUID.randomUUID(), "ana@test.com", true);
        when(userService.findAll(eq("ana"), any()))
                .thenReturn(new PageResponse<>(List.of(user), 0, 20, 1, 1));

        mvc.perform(get("/api/v1/users").param("search", "ana"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").value("ana@test.com"))
                .andExpect(jsonPath("$.content[0].roles[0]").value("ADMIN"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void rejectsUnsupportedSortProperty() throws Exception {
        mvc.perform(get("/api/v1/users").param("sort", "desconocido"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-002"))
                .andExpect(jsonPath("$.message").value("El criterio de ordenamiento no es válido."))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID));

        verify(userService, never()).findAll(any(), any());
    }

    @Test
    void acceptsAllowedSortProperty() throws Exception {
        when(userService.findAll(any(), any()))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0));

        mvc.perform(get("/api/v1/users").param("sort", "email,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    void validatesCreatePayload() throws Exception {
        mvc.perform(post("/api/v1/users")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"123\",\"firstName\":\"\",\"roles\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-001"))
                .andExpect(jsonPath("$.traceId").value(TRACE_ID))
                .andExpect(jsonPath("$.details[?(@.field == 'email')]").exists())
                .andExpect(jsonPath("$.details[?(@.field == 'password')]").exists())
                .andExpect(jsonPath("$.details[?(@.field == 'firstName')]").exists())
                .andExpect(jsonPath("$.details[?(@.field == 'roles')]").exists());

        verify(userService, never()).create(any(CreateUserRequest.class));
    }

    @Test
    void createsUser() throws Exception {
        UserResponse created = sampleUser(UUID.randomUUID(), "ana@test.com", true);
        when(userService.create(any(CreateUserRequest.class))).thenReturn(created);

        mvc.perform(post("/api/v1/users")
                        .contentType(APPLICATION_JSON)
                        .content("{\"email\":\"ANA@test.com\",\"password\":\"secret123\","
                                + "\"firstName\":\"Ana\",\"lastName\":\"López\",\"roles\":[\"ADMIN\"]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("ana@test.com"))
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    void preventsDeactivatingOwnAccount() throws Exception {
        UUID adminId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(adminId, "admin@test.com", "Admin", "Test", "hash",
                true, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        mvc.perform(patch("/api/v1/users/{id}/status", adminId)
                        .principal(new UsernamePasswordAuthenticationToken(
                                principal, null, principal.getAuthorities()))
                        .contentType(APPLICATION_JSON)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.flowCode").value("VAL-001"))
                .andExpect(jsonPath("$.message").value("No puedes desactivar tu propia cuenta."));

        verify(userService, never()).updateStatus(any(), eq(false));
    }

    @Test
    void deactivatesAnotherUser() throws Exception {
        UUID targetId = UUID.randomUUID();
        UserResponse disabled = sampleUser(targetId, "ana@test.com", false);
        when(userService.updateStatus(targetId, false)).thenReturn(disabled);

        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "admin@test.com", "Admin", "Test",
                "hash", true, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        mvc.perform(patch("/api/v1/users/{id}/status", targetId)
                        .principal(new UsernamePasswordAuthenticationToken(
                                principal, null, principal.getAuthorities()))
                        .contentType(APPLICATION_JSON)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        verify(userService).updateStatus(targetId, false);
    }

    private static UserResponse sampleUser(UUID id, String email, boolean enabled) {
        Instant now = Instant.now();
        return new UserResponse(id, email, "Ana", "López", enabled, List.of("ADMIN"), now, now);
    }
}
