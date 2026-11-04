package com.agencia.backoffice.user.dto;

import com.agencia.backoffice.user.RoleNames;
import com.agencia.backoffice.user.User;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Usuario del sistema")
public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        boolean enabled,
        List<String> roles,
        Instant createdAt,
        Instant updatedAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(),
                user.isEnabled(), RoleNames.fromRoles(user.getRoles()), user.getCreatedAt(), user.getUpdatedAt());
    }
}
