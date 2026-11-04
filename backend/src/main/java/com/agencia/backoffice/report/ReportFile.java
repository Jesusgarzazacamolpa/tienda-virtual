package com.agencia.backoffice.report;

public record ReportFile(
        String filename,
        String contentType,
        byte[] content
) {
}
