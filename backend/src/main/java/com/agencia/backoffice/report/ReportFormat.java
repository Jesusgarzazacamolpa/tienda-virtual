package com.agencia.backoffice.report;

import com.agencia.backoffice.common.error.ApiException;
import com.agencia.backoffice.common.error.FlowCode;

import java.util.Locale;

public enum ReportFormat {

    PDF("pdf", "application/pdf"),
    XLSX("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final String extension;
    private final String contentType;

    ReportFormat(String extension, String contentType) {
        this.extension = extension;
        this.contentType = contentType;
    }

    public String extension() {
        return extension;
    }

    public String contentType() {
        return contentType;
    }

    public static ReportFormat from(String value) {
        if (value == null || value.isBlank()) {
            return PDF;
        }
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(FlowCode.INVALID_REQUEST,
                    "El formato solicitado no es válido. Usa pdf o xlsx.");
        }
    }
}
