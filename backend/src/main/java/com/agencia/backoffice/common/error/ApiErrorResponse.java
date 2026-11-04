package com.agencia.backoffice.common.error;

import java.util.List;

public record ApiErrorResponse(
        String flowCode,
        String message,
        String traceId,
        java.time.Instant timestamp,
        List<FieldError> details
) {

    public record FieldError(String field, String message) {
    }

    public static ApiErrorResponse from(FlowCode flowCode, String message, String traceId,
                                        List<FieldError> details) {
        return new ApiErrorResponse(flowCode.code(), message, traceId, java.time.Instant.now(),
                List.copyOf(details));
    }
}
