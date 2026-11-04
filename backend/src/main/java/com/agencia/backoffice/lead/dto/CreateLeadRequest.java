package com.agencia.backoffice.lead.dto;

import com.agencia.backoffice.lead.LeadChallenge;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Solicitud de evaluación enviada desde la landing")
public record CreateLeadRequest(
        @Schema(description = "Nombre completo del prospecto", example = "Ana López")
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 120, message = "El nombre no puede superar 120 caracteres.")
        String fullName,

        @Schema(description = "Correo corporativo", example = "ana@empresa.com")
        @NotBlank(message = "El correo es obligatorio.")
        @Email(message = "El correo no tiene un formato válido.")
        @Size(max = 255, message = "El correo no puede superar 255 caracteres.")
        String email,

        @Schema(description = "Empresa", example = "Corporativo del Bajío")
        @NotBlank(message = "La empresa es obligatoria.")
        @Size(max = 160, message = "La empresa no puede superar 160 caracteres.")
        String company,

        @Schema(description = "Desafío principal a resolver",
                example = "MODERNIZATION")
        @NotNull(message = "Selecciona un desafío.")
        LeadChallenge challenge,

        @Schema(description = "Campo trampa para bots; debe viajar vacío", hidden = true)
        @Size(max = 200, message = "El campo no es válido.")
        String website
) {
}
