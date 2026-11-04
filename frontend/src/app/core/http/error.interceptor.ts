import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, from, mergeMap, throwError } from 'rxjs';

import { ApiError, normalizeHttpError } from './api-error';

export const errorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.error instanceof Blob) {
        return from(readBlobError(error)).pipe(mergeMap(normalized => throwError(() => normalized)));
      }
      return throwError(() => normalizeHttpError(error));
    })
  );

async function readBlobError(error: HttpErrorResponse): Promise<ApiError> {
  try {
    const body = JSON.parse(await (error.error as Blob).text()) as unknown;
    return normalizeHttpError(new HttpErrorResponse({
      error: body,
      headers: error.headers,
      status: error.status,
      statusText: error.statusText,
      url: error.url ?? undefined
    }));
  } catch {
    return normalizeHttpError(error);
  }
}
