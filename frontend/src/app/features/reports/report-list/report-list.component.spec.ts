import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { AuthService } from '@core/auth/auth.service';
import { errorInterceptor } from '@core/http/error.interceptor';
import { ReportDefinition } from '@core/reports/report.models';
import { ReportListComponent } from './report-list.component';

const API_URL = 'http://localhost:8080/api/v1/reports';

const USERS_REPORT: ReportDefinition = {
  code: 'users',
  title: 'Usuarios',
  description: 'Listado completo de usuarios con roles, estado y fecha de alta.',
  formats: ['pdf', 'xlsx']
};

async function waitFor(predicate: () => boolean, timeoutMs = 3000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) {
      throw new Error('La condición no se cumplió a tiempo.');
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

describe('ReportListComponent', () => {
  let fixture: ComponentFixture<ReportListComponent>;
  let httpMock: HttpTestingController;
  let anchorClickSpy: jasmine.Spy;

  beforeEach(() => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:report');
    spyOn(URL, 'revokeObjectURL').and.stub();
    anchorClickSpy = spyOn(HTMLAnchorElement.prototype, 'click').and.stub();

    TestBed.configureTestingModule({
      imports: [ReportListComponent],
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { isAdmin: signal(true) } }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ReportListComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function loadCatalog(): void {
    const request = httpMock.expectOne(API_URL);
    expect(request.request.method).toBe('GET');
    request.flush([USERS_REPORT]);
    fixture.detectChanges();
  }

  function clickButton(label: string): void {
    const button = Array.from(element().querySelectorAll('button')).find(
      candidate => candidate.textContent?.trim() === label
    );
    expect(button).withContext(`Botón ${label}`).toBeDefined();
    button!.click();
  }

  it('renders the catalog with a button per format', () => {
    loadCatalog();

    expect(element().textContent).toContain('Reportería');
    expect(element().textContent).toContain('Usuarios');
    expect(element().textContent).toContain(USERS_REPORT.description);
    expect(element().textContent).toContain('PDF');
    expect(element().textContent).toContain('Excel (XLSX)');
    expect(element().textContent).toContain('sin filtro');
  });

  it('downloads the report with the current filter and confirms the filename', () => {
    loadCatalog();
    fixture.componentInstance.onSearch('ana');
    fixture.detectChanges();
    expect(element().textContent).toContain('«ana»');

    clickButton('PDF');

    const request = httpMock.expectOne(req => req.url === `${API_URL}/users`);
    expect(request.request.params.get('format')).toBe('pdf');
    expect(request.request.params.get('search')).toBe('ana');

    request.flush(new Blob(['%PDF-']), {
      headers: { 'Content-Disposition': 'attachment; filename="usuarios-test.pdf"' }
    });
    fixture.detectChanges();

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(anchorClickSpy).toHaveBeenCalled();
    expect(element().textContent).toContain('Descarga iniciada: usuarios-test.pdf');
    expect(fixture.componentInstance.downloadingKey()).toBeNull();
  });

  it('shows the backend message when a download fails', async () => {
    loadCatalog();
    clickButton('Excel (XLSX)');

    const request = httpMock.expectOne(req => req.url === `${API_URL}/users`);
    request.flush(
      new Blob([
        JSON.stringify({
          flowCode: 'VAL-002',
          message: 'El formato solicitado no es válido. Usa pdf o xlsx.',
          traceId: 'trace-blob'
        })
      ], { type: 'application/json' }),
      { status: 400, statusText: 'Bad Request' }
    );

    await waitFor(() => fixture.componentInstance.downloadError() !== null);
    fixture.detectChanges();

    expect(fixture.componentInstance.downloadError()?.flowCode).toBe('VAL-002');
    expect(element().textContent).toContain('El formato solicitado no es válido.');
    expect(anchorClickSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.downloadingKey()).toBeNull();
  });

  it('shows a load error and retries the catalog', () => {
    const request = httpMock.expectOne(API_URL);
    request.flush(
      { flowCode: 'AUTH-002', message: 'No tienes permisos para realizar esta acción.', traceId: 'trace-403' },
      { status: 403, statusText: 'Forbidden' }
    );
    fixture.detectChanges();

    expect(element().textContent).toContain('No tienes permisos');

    clickButton('Reintentar');
    httpMock.expectOne(API_URL).flush([USERS_REPORT]);
    fixture.detectChanges();

    expect(element().textContent).toContain('Usuarios');
  });
});

describe('ReportListComponent without ADMIN role', () => {
  it('shows a restricted state without calling the API', () => {
    TestBed.configureTestingModule({
      imports: [ReportListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { isAdmin: signal(false) } }
      ]
    });

    const httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ReportListComponent);
    fixture.detectChanges();

    expect(httpMock.expectNone(API_URL)).toBeUndefined();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Acceso restringido');
    expect(fixture.componentInstance.loading()).toBeFalse();
  });
});
