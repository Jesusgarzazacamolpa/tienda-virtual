import { FlowCode, FLOW_CODE_MESSAGES, flowCodeFromStatus, isFlowCode } from './flow-code';

export interface ApiErrorDetail {
  field: string;
  message: string;
}

interface BackendErrorBody {
  flowCode?: unknown;
  message?: unknown;
  traceId?: unknown;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    readonly flowCode: FlowCode,
    message: string,
    readonly traceId: string | null,
    readonly status: number,
    readonly details: ApiErrorDetail[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function normalizeHttpError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const response = error as {
    status?: number;
    error?: unknown;
    headers?: { get(name: string): string | null };
  };
  const status = typeof response.status === 'number' ? response.status : 0;

  if (status === 0) {
    return new ApiError('NET-001', FLOW_CODE_MESSAGES['NET-001'], null, 0);
  }

  const body: BackendErrorBody =
    typeof response.error === 'object' && response.error !== null ? (response.error as BackendErrorBody) : {};
  const flowCode = isFlowCode(body.flowCode) ? body.flowCode : flowCodeFromStatus(status);
  const traceId =
    typeof body.traceId === 'string' && body.traceId.length > 0
      ? body.traceId
      : response.headers?.get('X-Trace-Id') ?? null;

  const backendMessage = typeof body.message === 'string' && body.message.trim().length > 0 ? body.message : null;
  const message = backendMessage ?? FLOW_CODE_MESSAGES[flowCode];
  const finalMessage =
    flowCode === 'GEN-500' && traceId ? `${message} Código de seguimiento: ${traceId}.` : message;

  return new ApiError(flowCode, finalMessage, traceId, status, readDetails(body.details));
}

function readDetails(value: unknown): ApiErrorDetail[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is ApiErrorDetail =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as ApiErrorDetail).field === 'string' &&
      typeof (item as ApiErrorDetail).message === 'string'
  );
}
