package com.agencia.backoffice.auth;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.agencia.backoffice.auth.dto.LoginRequest;
import com.agencia.backoffice.auth.dto.LoginResponse;
import com.agencia.backoffice.common.error.ApiException;
import com.agencia.backoffice.common.error.FlowCode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private AuthenticationManager authenticationManager;
    private JwtService jwtService;
    private AuthService authService;
    private ListAppender<ILoggingEvent> logs;

    @BeforeEach
    void setUp() {
        authenticationManager = mock(AuthenticationManager.class);
        jwtService = mock(JwtService.class);
        authService = new AuthService(authenticationManager, jwtService);

        logs = new ListAppender<>();
        logs.start();
        ((Logger) LoggerFactory.getLogger(AuthService.class)).addAppender(logs);
    }

    @AfterEach
    void tearDown() {
        ((Logger) LoggerFactory.getLogger(AuthService.class)).detachAppender(logs);
        logs.stop();
    }

    @Test
    void logsEachLoginStepAndReturnsSortedRoles() {
        UserPrincipal principal = principal();
        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken(
                        principal, null, principal.getAuthorities()));
        when(jwtService.generateToken(principal)).thenReturn("jwt-token");
        when(jwtService.expirationSeconds()).thenReturn(3600L);

        LoginResponse response = authService.login(new LoginRequest("  USER@test.com  ", "Secret123!"));

        assertEquals("jwt-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals(3600L, response.expiresInSeconds());
        assertEquals("user@test.com", response.user().email());
        assertEquals(List.of("ADMIN", "USER"), response.user().roles());

        ArgumentCaptor<Authentication> authentication = ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(authentication.capture());
        assertEquals("user@test.com", authentication.getValue().getPrincipal());

        String output = logOutput();
        assertThat(output)
                .contains("flow=AUTH-LOGIN step=start")
                .contains("flow=AUTH-LOGIN step=validating-credentials")
                .contains("flow=AUTH-LOGIN step=success")
                .contains("roles=[ADMIN, USER]")
                .doesNotContain("Secret123!")
                .doesNotContain("jwt-token");
    }

    @Test
    void logsBadCredentialsWithAuthFlowCode() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("bad credentials"));

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(new LoginRequest("user@test.com", "Secret123!")));

        assertEquals(FlowCode.UNAUTHORIZED, ex.flowCode());
        String output = logOutput();
        assertThat(output)
                .contains("flow=AUTH-LOGIN step=failed")
                .contains("flowCode=AUTH-001")
                .contains("reason=bad-credentials")
                .doesNotContain("Secret123!");
    }

    @Test
    void logsDisabledAccountsWithoutLeakingPassword() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new DisabledException("disabled"));

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(new LoginRequest("user@test.com", "Secret123!")));

        assertEquals(FlowCode.UNAUTHORIZED, ex.flowCode());
        assertThat(logOutput())
                .contains("flowCode=AUTH-001")
                .contains("reason=account-disabled")
                .doesNotContain("Secret123!");
    }

    private UserPrincipal principal() {
        return new UserPrincipal(UUID.randomUUID(), "user@test.com", "Test", "User", "hash", true,
                List.of(new SimpleGrantedAuthority("ROLE_USER"), new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    private String logOutput() {
        return logs.list.stream()
                .map(ILoggingEvent::getFormattedMessage)
                .reduce("", (left, right) -> left + "\n" + right);
    }
}
