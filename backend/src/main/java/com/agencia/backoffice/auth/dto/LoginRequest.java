package com.agencia.backoffice.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Credenciales de acceso")
public record LoginRequest(
        @Schema(description = "Email del usuario", example = "admin@backoffice.local")
        @NotBlank(message = "El correo es obligatorio.")
        @Email(message = "El correo no tiene un formato válido.")
        String email,

        @Schema(description = "Contraseña del usuario", example = "Admin123!")
        @NotBlank(message = "La contraseña es obligatoria.")
        String password
) {
}
