package com.agencia.backoffice.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Cambio de estado de la cuenta")
public record UpdateUserStatusRequest(
        @Schema(description = "true activa la cuenta, false la desactiva", example = "false")
        @NotNull(message = "El estado es obligatorio.")
        Boolean enabled
) {
}
