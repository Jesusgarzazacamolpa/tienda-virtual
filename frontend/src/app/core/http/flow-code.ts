export const FLOW_CODE_MESSAGES = {
  'VAL-001': 'Los datos enviados no son válidos.',
  'VAL-002': 'La solicitud no se pudo interpretar.',
  'VAL-003': 'El método HTTP no está permitido para este recurso.',
  'AUTH-001': 'Tu sesión no es válida o expiró.',
  'AUTH-002': 'No tienes permisos para realizar esta acción.',
  'RES-001': 'El recurso solicitado no existe.',
  'RES-002': 'La operación entra en conflicto con el estado actual.',
  'GEN-500': 'Ocurrió un error inesperado. Contacta a soporte con el código de seguimiento.',
  'NET-001': 'No se pudo conectar con el servidor. Revisa tu conexión.'
} as const;

export type FlowCode = keyof typeof FLOW_CODE_MESSAGES;

export function isFlowCode(value: unknown): value is FlowCode {
  return typeof value === 'string' && value in FLOW_CODE_MESSAGES;
}

export function flowCodeFromStatus(status: number): FlowCode {
  switch (status) {
    case 400:
      return 'VAL-001';
    case 401:
      return 'AUTH-001';
    case 403:
      return 'AUTH-002';
    case 404:
      return 'RES-001';
    case 405:
      return 'VAL-003';
    case 409:
      return 'RES-002';
    default:
      return 'GEN-500';
  }
}
