package com.agencia.backoffice.report;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Reporte disponible para descarga")
public record ReportDefinition(
        String code,
        String title,
        String description,
        List<String> formats
) {
}
