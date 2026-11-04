package com.agencia.backoffice.lead;

import com.agencia.backoffice.lead.dto.CreateLeadRequest;
import com.agencia.backoffice.lead.dto.LeadResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leads")
@Tag(name = "Leads", description = "Captación de prospectos desde la landing pública.")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping
    @Operation(summary = "Registrar lead",
            description = "Endpoint público de la landing. Responde 202 sin guardar cuando se llena el honeypot.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Lead registrado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos (VAL-001)"),
            @ApiResponse(responseCode = "202", description = "Solicitud descartada como spam")
    })
    public ResponseEntity<LeadResponse> create(@Valid @RequestBody CreateLeadRequest request) {
        return leadService.create(request)
                .map(lead -> ResponseEntity.status(HttpStatus.CREATED).body(lead))
                .orElseGet(() -> ResponseEntity.accepted().build());
    }
}
