package com.agencia.backoffice.common.error;

import java.util.List;

public class ApiException extends RuntimeException {

    private final FlowCode flowCode;
    private final List<ApiErrorResponse.FieldError> details;

    public ApiException(FlowCode flowCode) {
        this(flowCode, flowCode.message());
    }

    public ApiException(FlowCode flowCode, String message) {
        this(flowCode, message, List.of());
    }

    public ApiException(FlowCode flowCode, String message, List<ApiErrorResponse.FieldError> details) {
        super(message);
        this.flowCode = flowCode;
        this.details = List.copyOf(details);
    }

    public FlowCode flowCode() {
        return flowCode;
    }

    public List<ApiErrorResponse.FieldError> details() {
        return details;
    }
}
