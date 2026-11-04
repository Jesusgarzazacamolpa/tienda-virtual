import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiError } from './api-error';
import { errorInterceptor } from './error.interceptor';

const USERS_URL = 'http://localhost:8080/api/v1/users';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([errorInterceptor])), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('normalizes a backend error keeping flowCode, message and traceId', done => {
    http.get(USERS_URL).subscribe({
      next: () => done.fail('Expected an error response'),
      error: (error: ApiError) => {
        expect(error instanceof ApiError).toBeTrue();
        expect(error.flowCode).toBe('AUTH-001');
        expect(error.message).toBe('Tu sesión no es válida o expiró.');
        expect(error.traceId).toBe('trace-401');
        expect(error.status).toBe(401);
        done();
      }
    });

    httpMock.expectOne(USERS_URL).flush(
      {
        flowCode: 'AUTH-001',
        message: 'Tu sesión no es válida o expiró.',
        traceId: 'trace-401',
        timestamp: '2026-11-03T15:30:00Z',
        details: []
      },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('prefers the specific backend message', done => {
    http.post(USERS_URL, {}).subscribe({
      next: () => done.fail('Expected an error response'),
      error: (error: ApiError) => {
        expect(error.flowCode).toBe('RES-002');
        expect(error.message).toBe('El correo ya está registrado.');
        expect(error.status).toBe(409);
        done();
      }
    });

    httpMock.expectOne(USERS_URL).flush(
      {
        flowCode: 'RES-002',
        message: 'El correo ya está registrado.',
        traceId: 'trace-409',
        timestamp: '2026-11-03T15:30:00Z',
        details: []
      },
      { status: 409, statusText: 'Conflict' }
    );
  });

  it('maps the status when the body has no flowCode and appends the traceId for GEN-500', done => {
    http.get(USERS_URL).subscribe({
      next: () => done.fail('Expected an error response'),
      error: (error: ApiError) => {
        expect(error.flowCode).toBe('GEN-500');
        expect(error.traceId).toBe('trace-500');
        expect(error.message).toContain('Código de seguimiento: trace-500.');
        expect(error.status).toBe(500);
        done();
      }
    });

    httpMock
      .expectOne(USERS_URL)
      .flush({}, { status: 500, statusText: 'Server Error', headers: { 'X-Trace-Id': 'trace-500' } });
  });

  it('keeps validation details from the backend', done => {
    http.post(USERS_URL, {}).subscribe({
      next: () => done.fail('Expected an error response'),
      error: (error: ApiError) => {
        expect(error.flowCode).toBe('VAL-001');
        expect(error.details).toEqual([{ field: 'email', message: 'El correo es obligatorio.' }]);
        done();
      }
    });

    httpMock.expectOne(USERS_URL).flush(
      {
        flowCode: 'VAL-001',
        message: 'Los datos enviados no son válidos.',
        traceId: 'trace-400',
        timestamp: '2026-11-03T15:30:00Z',
        details: [{ field: 'email', message: 'El correo es obligatorio.' }]
      },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('maps network failures to NET-001', done => {
    http.get(USERS_URL).subscribe({
      next: () => done.fail('Expected a network error'),
      error: (error: ApiError) => {
        expect(error.flowCode).toBe('NET-001');
        expect(error.status).toBe(0);
        expect(error.traceId).toBeNull();
        expect(error.message).toContain('No se pudo conectar con el servidor.');
        done();
      }
    });

    httpMock.expectOne(USERS_URL).error(new ProgressEvent('error'));
  });

  it('reads a JSON error delivered as a Blob for file downloads', done => {
    const url = `${USERS_URL}/report`;

    http.get(url, { responseType: 'blob' }).subscribe({
      next: () => done.fail('Expected an error response'),
      error: (error: ApiError) => {
        expect(error.flowCode).toBe('VAL-002');
        expect(error.message).toBe('El formato solicitado no es válido. Usa pdf o xlsx.');
        expect(error.traceId).toBe('trace-blob');
        expect(error.status).toBe(400);
        done();
      }
    });

    httpMock.expectOne(url).flush(
      new Blob([
        JSON.stringify({
          flowCode: 'VAL-002',
          message: 'El formato solicitado no es válido. Usa pdf o xlsx.',
          traceId: 'trace-blob',
          timestamp: '2026-11-03T15:30:00Z',
          details: []
        })
      ], { type: 'application/json' }),
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('falls back to the status when a Blob error has no JSON body', done => {
    const url = `${USERS_URL}/report`;

    http.get(url, { responseType: 'blob' }).subscribe({
      next: () => done.fail('Expected an error response'),
      error: (error: ApiError) => {
        expect(error.flowCode).toBe('GEN-500');
        expect(error.status).toBe(500);
        expect(error.traceId).toBe('trace-blob-500');
        done();
      }
    });

    httpMock.expectOne(url).flush(
      new Blob(['upstream failure'], { type: 'text/plain' }),
      { status: 500, statusText: 'Server Error', headers: { 'X-Trace-Id': 'trace-blob-500' } }
    );
  });
});
