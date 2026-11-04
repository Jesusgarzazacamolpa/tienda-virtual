package com.agencia.backoffice.common.error;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

/**
 * Traduce toda excepción a un {@link FlowCode} con su traceId. Nunca se
 * serializa el stacktrace ni el mensaje original de errores inesperados.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final TraceIdResolver traceIdResolver;

    public GlobalExceptionHandler(TraceIdResolver traceIdResolver) {
        this.traceIdResolver = traceIdResolver;
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException ex) {
        FlowCode flowCode = ex.flowCode();
        if (flowCode.status().is5xxServerError()) {
            log.error("flowCode={} message={}", flowCode.code(), ex.getMessage(), ex);
        } else {
            log.warn("flowCode={} message={}", flowCode.code(), ex.getMessage());
        }
        return build(flowCode, ex.getMessage(), ex.details());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ApiErrorResponse.FieldError> details = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ApiErrorResponse.FieldError(error.getField(), error.getDefaultMessage()))
                .toList();
        log.warn("flowCode={} fields={}", FlowCode.VALIDATION_ERROR.code(),
                details.stream().map(ApiErrorResponse.FieldError::field).toList());
        return build(FlowCode.VALIDATION_ERROR, FlowCode.VALIDATION_ERROR.message(), details);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        log.warn("flowCode={} message={}", FlowCode.INVALID_REQUEST.code(), ex.getMessage());
        return build(FlowCode.INVALID_REQUEST, FlowCode.INVALID_REQUEST.message(), List.of());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.warn("flowCode={} parameter={}", FlowCode.INVALID_REQUEST.code(), ex.getName());
        return build(FlowCode.INVALID_REQUEST,
                "Uno de los parámetros de la solicitud no tiene un formato válido.", List.of());
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        log.warn("flowCode={} contentType={}", FlowCode.INVALID_REQUEST.code(), ex.getContentType());
        return build(FlowCode.INVALID_REQUEST, FlowCode.INVALID_REQUEST.message(), List.of());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        log.warn("flowCode={} method={}", FlowCode.METHOD_NOT_ALLOWED.code(), ex.getMethod());
        return build(FlowCode.METHOD_NOT_ALLOWED, FlowCode.METHOD_NOT_ALLOWED.message(), List.of());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoResource(NoResourceFoundException ex) {
        log.warn("flowCode={} path={}", FlowCode.NOT_FOUND.code(), ex.getResourcePath());
        return build(FlowCode.NOT_FOUND, FlowCode.NOT_FOUND.message(), List.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("flowCode={} cause={}", FlowCode.CONFLICT.code(),
                ex.getMostSpecificCause().getClass().getSimpleName());
        return build(FlowCode.CONFLICT, FlowCode.CONFLICT.message(), List.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("flowCode={} message={}", FlowCode.FORBIDDEN.code(), ex.getMessage());
        return build(FlowCode.FORBIDDEN, FlowCode.FORBIDDEN.message(), List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return build(FlowCode.INTERNAL_ERROR, FlowCode.INTERNAL_ERROR.message(), List.of());
    }

    private ResponseEntity<ApiErrorResponse> build(FlowCode flowCode, String message,
                                                   List<ApiErrorResponse.FieldError> details) {
        return ResponseEntity.status(flowCode.status())
                .body(ApiErrorResponse.from(flowCode, message, traceIdResolver.currentTraceId(), details));
    }
}
