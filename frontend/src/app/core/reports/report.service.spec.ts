import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ReportService } from './report.service';

const API_URL = 'http://localhost:8080/api/v1/reports';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the report catalog', () => {
    let codes: string[] = [];

    service.catalog().subscribe(reports => (codes = reports.map(report => report.code)));

    const request = httpMock.expectOne(API_URL);
    expect(request.request.method).toBe('GET');
    request.flush([
      { code: 'users', title: 'Usuarios', description: 'Listado.', formats: ['pdf', 'xlsx'] }
    ]);

    expect(codes).toEqual(['users']);
  });

  it('downloads a report with the selected format and search term', () => {
    let filename = '';

    service.download('users', 'xlsx', '  ana  ').subscribe(file => (filename = file.filename));

    const request = httpMock.expectOne(req => req.url === `${API_URL}/users`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('format')).toBe('xlsx');
    expect(request.request.params.get('search')).toBe('ana');

    request.flush(new Blob(['PK']), {
      headers: { 'Content-Disposition': 'attachment; filename="usuarios-20260101-1200.xlsx"' }
    });

    expect(filename).toBe('usuarios-20260101-1200.xlsx');
  });

  it('falls back to a generated filename without Content-Disposition', () => {
    let filename = '';

    service.download('users', 'pdf', '').subscribe(file => (filename = file.filename));

    const request = httpMock.expectOne(req => req.url === `${API_URL}/users`);
    expect(request.request.params.has('search')).toBeFalse();
    request.flush(new Blob(['%PDF-']));

    expect(filename).toBe('users.pdf');
  });

  it('decodes a UTF-8 filename from Content-Disposition', () => {
    let filename = '';

    service.download('users', 'pdf', '').subscribe(file => (filename = file.filename));

    httpMock.expectOne(req => req.url === `${API_URL}/users`).flush(new Blob(['%PDF-']), {
      headers: { 'Content-Disposition': "attachment; filename*=UTF-8''usuarios-a%C3%B1o.pdf" }
    });

    expect(filename).toBe('usuarios-año.pdf');
  });
});
