import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { LeadPayload } from './lead.models';
import { LeadService } from './lead.service';

describe('LeadService', () => {
  let service: LeadService;
  let http: HttpTestingController;

  const payload: LeadPayload = {
    fullName: 'Ana López',
    email: 'ana@garza.com.mx',
    company: 'Grupo Bajío',
    challenge: 'INTEGRATIONS',
    website: ''
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(LeadService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía el lead al endpoint configurado', () => {
    service.submit(payload).subscribe();

    const request = http.expectOne(`${environment.apiBaseUrl}/leads`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ id: 'lead-1', createdAt: '2026-11-03T10:00:00Z' });
  });
});
