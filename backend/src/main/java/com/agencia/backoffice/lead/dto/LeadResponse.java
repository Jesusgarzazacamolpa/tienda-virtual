package com.agencia.backoffice.lead.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Lead registrado")
public record LeadResponse(
        UUID id,
        Instant createdAt
) {
}
