package com.agencia.backoffice.auth;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "test-secret-32-bytes-minimum-000000000";

    private final JwtService jwtService = new JwtService(new JwtProperties(SECRET, 60, "backoffice-test"));
    private final UserPrincipal principal = new UserPrincipal(
            UUID.randomUUID(), "user@test.com", "Test", "User", "hash", true,
            List.of(new SimpleGrantedAuthority("ROLE_USER")));

    @Test
    void generatesTokenWithSubjectAndExpiration() {
        String token = jwtService.generateToken(principal);

        assertThat(jwtService.extractUsername(token)).isEqualTo("user@test.com");
        assertThat(jwtService.isTokenValid(token, principal)).isTrue();
        assertThat(jwtService.expirationSeconds()).isEqualTo(3600);
    }

    @Test
    void rejectsTokenForAnotherUser() {
        String token = jwtService.generateToken(principal);
        UserPrincipal other = new UserPrincipal(
                UUID.randomUUID(), "other@test.com", "Other", "User", "hash", true, List.of());

        assertThat(jwtService.isTokenValid(token, other)).isFalse();
    }

    @Test
    void rejectsTamperedToken() {
        String token = jwtService.generateToken(principal);
        String tampered = token.substring(0, token.length() - 4) + "xxxx";

        assertThat(jwtService.isTokenValid(tampered, principal)).isFalse();
    }

    @Test
    void rejectsTokenSignedWithAnotherSecret() {
        JwtService other = new JwtService(
                new JwtProperties("another-secret-32-bytes-minimum-00000", 60, "backoffice-test"));
        String token = other.generateToken(principal);

        assertThat(jwtService.isTokenValid(token, principal)).isFalse();
        assertThatThrownBy(() -> jwtService.extractUsername(token))
                .isInstanceOf(JwtException.class);
    }
}
