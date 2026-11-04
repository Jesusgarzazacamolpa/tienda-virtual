package com.agencia.backoffice.auth.dto;

import com.agencia.backoffice.auth.UserPrincipal;
import com.agencia.backoffice.user.RoleNames;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(description = "Usuario autenticado incluido en la sesión")
public record AuthenticatedUser(
        UUID id,
        String email,
        String firstName,
        String lastName,
        List<String> roles
) {

    public static AuthenticatedUser from(UserPrincipal principal) {
        return new AuthenticatedUser(principal.id(), principal.email(), principal.firstName(),
                principal.lastName(), RoleNames.fromAuthorities(principal.getAuthorities()));
    }
}
