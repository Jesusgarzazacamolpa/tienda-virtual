import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { LoginResponse } from './auth.models';

const API_BASE_URL = 'http://localhost:8080/api/v1';
const LOGIN_RESPONSE: LoginResponse = {
  accessToken: 'jwt-token',
  tokenType: 'Bearer',
  expiresInSeconds: 3600,
  user: {
    id: '9b3f0f4c-8a40-4d8a-bf2c-2f6a1f1a8a11',
    email: 'admin@backoffice.local',
    firstName: 'Local',
    lastName: 'Admin',
    roles: ['ADMIN']
  }
};

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()]
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('does not attach Authorization when there is no session', () => {
    http.get(`${API_BASE_URL}/users`).subscribe();

    const request = httpMock.expectOne(`${API_BASE_URL}/users`);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
  });

  it('attaches the Bearer token to API requests', () => {
    authenticate(authService, httpMock);

    http.get(`${API_BASE_URL}/users`).subscribe();

    const request = httpMock.expectOne(`${API_BASE_URL}/users`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({});
  });

  it('never sends the token to the login endpoint', () => {
    authenticate(authService, httpMock);

    http.post(`${API_BASE_URL}/auth/login`, {}).subscribe();

    const request = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush(LOGIN_RESPONSE);
  });

  it('never sends the token to external URLs', () => {
    authenticate(authService, httpMock);

    http.get('https://external.example.com/data').subscribe();

    const request = httpMock.expectOne('https://external.example.com/data');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
  });
});

function authenticate(service: AuthService, httpMock: HttpTestingController): void {
  service.login({ email: 'admin@backoffice.local', password: 'Admin123!' }).subscribe();
  httpMock.expectOne(`${API_BASE_URL}/auth/login`).flush(LOGIN_RESPONSE);
}
