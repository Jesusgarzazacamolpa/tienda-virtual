package com.agencia.backoffice.auth;

import com.agencia.backoffice.auth.dto.AuthenticatedUser;
import com.agencia.backoffice.auth.dto.LoginRequest;
import com.agencia.backoffice.auth.dto.LoginResponse;
import com.agencia.backoffice.common.error.ApiException;
import com.agencia.backoffice.common.error.FlowCode;
import com.agencia.backoffice.common.text.Emails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    // Identifica el flujo en los logs; el flowCode oficial solo se agrega al fallar.
    private static final String FLOW = "AUTH-LOGIN";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        String email = Emails.normalize(request.email());
        log.info("flow={} step=start email={}", FLOW, email);
        log.info("flow={} step=validating-credentials email={}", FLOW, email);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            AuthenticatedUser user = AuthenticatedUser.from(principal);
            LoginResponse response = new LoginResponse(
                    jwtService.generateToken(principal), "Bearer", jwtService.expirationSeconds(), user);

            log.info("flow={} step=success userId={} roles={}", FLOW, user.id(), user.roles());
            return response;
        } catch (AuthenticationException ex) {
            log.warn("flow={} step=failed flowCode={} reason={} email={}",
                    FLOW, FlowCode.UNAUTHORIZED.code(), reason(ex), email);
            throw new ApiException(FlowCode.UNAUTHORIZED, "Credenciales inválidas.");
        }
    }

    private static String reason(AuthenticationException ex) {
        if (ex instanceof DisabledException) {
            return "account-disabled";
        }
        if (ex instanceof LockedException) {
            return "account-locked";
        }
        if (ex instanceof BadCredentialsException) {
            return "bad-credentials";
        }
        return "authentication-error";
    }
}
