import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { AuthSession, LoginResponse } from './auth.models';

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

const LOGIN_URL = 'http://localhost:8080/api/v1/auth/login';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts without a session', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.token()).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAdmin()).toBeFalse();
  });

  it('stores token, user and roles after login', () => {
    let loggedUserEmail = '';

    service.login({ email: 'admin@backoffice.local', password: 'Admin123!' }).subscribe(user => {
      loggedUserEmail = user.email;
    });

    const request = httpMock.expectOne(LOGIN_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'admin@backoffice.local', password: 'Admin123!' });
    request.flush(LOGIN_RESPONSE);

    expect(loggedUserEmail).toBe('admin@backoffice.local');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.token()).toBe('jwt-token');
    expect(service.roles()).toEqual(['ADMIN']);
    expect(service.isAdmin()).toBeTrue();
    expect(service.user()?.firstName).toBe('Local');

    const stored = JSON.parse(localStorage.getItem('backoffice.session') ?? '{}') as AuthSession;
    expect(stored.token).toBe('jwt-token');
    expect(stored.expiresAt).toBeGreaterThan(Date.now());
  });

  it('clears the session and storage on logout', () => {
    authenticate(service, httpMock);

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.token()).toBeNull();
    expect(service.isAdmin()).toBeFalse();
    expect(localStorage.getItem('backoffice.session')).toBeNull();
  });

  it('restores a valid session from storage', () => {
    const stored: AuthSession = {
      token: 'restored-token',
      expiresAt: Date.now() + 60_000,
      user: {
        id: 'c0ffee00-0000-4000-8000-000000000001',
        email: 'ana@empresa.com',
        firstName: 'Ana',
        lastName: null,
        roles: ['USER']
      }
    };
    localStorage.setItem('backoffice.session', JSON.stringify(stored));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const restored = TestBed.inject(AuthService);

    expect(restored.isAuthenticated()).toBeTrue();
    expect(restored.token()).toBe('restored-token');
    expect(restored.user()?.email).toBe('ana@empresa.com');
    expect(restored.isAdmin()).toBeFalse();
  });

  it('discards an expired stored session', () => {
    const expired: AuthSession = {
      token: 'expired-token',
      expiresAt: Date.now() - 1_000,
      user: {
        id: 'c0ffee00-0000-4000-8000-000000000002',
        email: 'ana@empresa.com',
        firstName: 'Ana',
        lastName: null,
        roles: ['USER']
      }
    };
    localStorage.setItem('backoffice.session', JSON.stringify(expired));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const restored = TestBed.inject(AuthService);

    expect(restored.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('backoffice.session')).toBeNull();
  });

  it('discards a corrupted stored session', () => {
    localStorage.setItem('backoffice.session', 'not-json');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const restored = TestBed.inject(AuthService);

    expect(restored.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('backoffice.session')).toBeNull();
  });
});

function authenticate(service: AuthService, httpMock: HttpTestingController): void {
  service.login({ email: 'admin@backoffice.local', password: 'Admin123!' }).subscribe();
  httpMock.expectOne(LOGIN_URL).flush(LOGIN_RESPONSE);
}
