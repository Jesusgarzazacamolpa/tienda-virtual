import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { User } from './user.models';
import { UserService } from './user.service';

const API_URL = 'http://localhost:8080/api/v1/users';

const USER: User = {
  id: '9b3f0f4c-8a40-4d8a-bf2c-2f6a1f1a8a11',
  email: 'ana@empresa.com',
  firstName: 'Ana',
  lastName: 'López',
  enabled: true,
  roles: ['USER'],
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-02T10:00:00Z'
};

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists users with pagination and without an empty search param', () => {
    service.list('   ', 0, 10).subscribe();

    const request = httpMock.expectOne(req => req.url === API_URL);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('10');
    expect(request.request.params.has('search')).toBeFalse();
    request.flush({ content: [USER], page: 0, size: 10, totalElements: 1, totalPages: 1 });
  });

  it('sends a trimmed search term', () => {
    service.list('  ana  ', 2, 20).subscribe();

    const request = httpMock.expectOne(req => req.url === API_URL);
    expect(request.request.params.get('search')).toBe('ana');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('20');
    request.flush({ content: [], page: 2, size: 20, totalElements: 0, totalPages: 0 });
  });

  it('creates a user', () => {
    const payload = {
      email: 'ana@empresa.com',
      password: 'Secret123!',
      firstName: 'Ana',
      lastName: null,
      roles: ['USER']
    };

    service.create(payload).subscribe();

    const request = httpMock.expectOne(API_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(USER, { status: 201, statusText: 'Created' });
  });

  it('updates a user', () => {
    const payload = { email: 'ana@empresa.com', firstName: 'Ana María', lastName: null, roles: ['ADMIN', 'USER'] };

    service.update(USER.id, payload).subscribe();

    const request = httpMock.expectOne(`${API_URL}/${USER.id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...USER, roles: payload.roles });
  });

  it('updates the user status', () => {
    service.updateStatus(USER.id, false).subscribe();

    const request = httpMock.expectOne(`${API_URL}/${USER.id}/status`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ enabled: false });
    request.flush({ ...USER, enabled: false });
  });
});
