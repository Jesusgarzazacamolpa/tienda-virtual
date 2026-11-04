package com.agencia.backoffice.common.error;

import org.springframework.http.HttpStatus;

/**
 * Catálogo de códigos de flujo. El frontend traduce el código a un mensaje
 * accionable; el backend nunca expone detalles técnicos.
 */
public enum FlowCode {

    VALIDATION_ERROR("VAL-001", HttpStatus.BAD_REQUEST, "Los datos enviados no son válidos."),
    INVALID_REQUEST("VAL-002", HttpStatus.BAD_REQUEST, "La solicitud no se pudo interpretar."),
    METHOD_NOT_ALLOWED("VAL-003", HttpStatus.METHOD_NOT_ALLOWED, "El método HTTP no está permitido para este recurso."),
    UNAUTHORIZED("AUTH-001", HttpStatus.UNAUTHORIZED, "Tu sesión no es válida o expiró."),
    FORBIDDEN("AUTH-002", HttpStatus.FORBIDDEN, "No tienes permisos para realizar esta acción."),
    NOT_FOUND("RES-001", HttpStatus.NOT_FOUND, "El recurso solicitado no existe."),
    CONFLICT("RES-002", HttpStatus.CONFLICT, "La operación entra en conflicto con el estado actual."),
    INTERNAL_ERROR("GEN-500", HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado. Contacta a soporte con el código de seguimiento.");

    private final String code;
    private final HttpStatus status;
    private final String message;

    FlowCode(String code, HttpStatus status, String message) {
        this.code = code;
        this.status = status;
        this.message = message;
    }

    public String code() {
        return code;
    }

    public HttpStatus status() {
        return status;
    }

    public String message() {
        return message;
    }
}
