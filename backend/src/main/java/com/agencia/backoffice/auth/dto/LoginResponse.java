package com.agencia.backoffice.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        AuthenticatedUser user
) {
}
