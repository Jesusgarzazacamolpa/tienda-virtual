package com.agencia.backoffice.report;

import com.agencia.backoffice.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Reportería", description = "Catálogo y descarga de reportes. Requiere rol ADMIN.")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    @Operation(summary = "Catálogo de reportes", description = "Lista los reportes disponibles y sus formatos.")
    public List<ReportDefinition> catalog() {
        return reportService.catalog();
    }

    @GetMapping("/{code}")
    @Operation(summary = "Descargar reporte",
            description = "Genera el reporte solicitado. Formatos disponibles: `pdf` y `xlsx`.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Archivo generado"),
            @ApiResponse(responseCode = "400", description = "Formato inválido (VAL-002)"),
            @ApiResponse(responseCode = "404", description = "Reporte inexistente (RES-001)")
    })
    public ResponseEntity<byte[]> download(
            @PathVariable String code,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        ReportFile file = reportService.generate(code, ReportFormat.from(format), search,
                authentication == null ? null : authentication.getName());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.filename()).build().toString())
                .body(file.content());
    }
}
