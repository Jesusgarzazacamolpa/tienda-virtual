package com.agencia.backoffice.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Datos para actualizar un usuario (la contraseña no cambia)")
public record UpdateUserRequest(
        @Schema(description = "Email único del usuario", example = "ana@empresa.com")
        @NotBlank(message = "El email es obligatorio.")
        @Email(message = "El email no tiene un formato válido.")
        @Size(max = 255, message = "El email no puede superar 255 caracteres.")
        String email,

        @Schema(description = "Nombre", example = "Ana María")
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres.")
        String firstName,

        @Schema(description = "Apellido", example = "López")
        @Size(max = 100, message = "El apellido no puede superar 100 caracteres.")
        String lastName,

        @Schema(description = "Roles existentes a asignar", example = "[\"USER\",\"ADMIN\"]")
        @NotEmpty(message = "Selecciona al menos un rol.")
        List<@NotBlank(message = "El rol no puede estar vacío.") String> roles
) {
}
