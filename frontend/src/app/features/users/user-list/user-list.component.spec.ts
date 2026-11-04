import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { AuthUser } from '@core/auth/auth.models';
import { AuthService } from '@core/auth/auth.service';
import { errorInterceptor } from '@core/http/error.interceptor';
import { User } from '@core/users/user.models';
import { UserListComponent } from './user-list.component';

const API_URL = 'http://localhost:8080/api/v1/users';

const ADMIN_USER: AuthUser = {
  id: 'admin-id',
  email: 'admin@backoffice.local',
  firstName: 'Local',
  lastName: 'Admin',
  roles: ['ADMIN']
};

const ANA: User = {
  id: '9b3f0f4c-8a40-4d8a-bf2c-2f6a1f1a8a11',
  email: 'ana@empresa.com',
  firstName: 'Ana',
  lastName: 'López',
  enabled: true,
  roles: ['USER'],
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-02T10:00:00Z'
};

const LUIS: User = {
  id: 'c0ffee00-0000-4000-8000-000000000001',
  email: 'luis@empresa.com',
  firstName: 'Luis',
  lastName: null,
  enabled: false,
  roles: ['USER'],
  createdAt: '2026-01-03T10:00:00Z',
  updatedAt: '2026-01-04T10:00:00Z'
};

describe('UserListComponent', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            isAdmin: signal(true),
            user: signal<AuthUser | null>(ADMIN_USER)
          }
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UserListComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function initialRequest(users: User[], totalElements = users.length, totalPages = 1): void {
    const request = httpMock.expectOne(req => req.method === 'GET' && req.url === API_URL);
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('10');
    request.flush({ content: users, page: 0, size: 10, totalElements, totalPages });
    fixture.detectChanges();
  }

  it('loads and renders the first page', () => {
    initialRequest([ANA, LUIS]);

    const rows = element().querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(element().textContent).toContain('Ana López');
    expect(element().textContent).toContain('ana@empresa.com');
    expect(element().textContent).toContain('Activo');
    expect(element().textContent).toContain('Inactivo');
  });

  it('resets the page and sends the search term', () => {
    initialRequest([ANA], 25, 3);

    fixture.componentInstance.changePage(1);
    const secondPage = httpMock.expectOne(req => req.method === 'GET' && req.url === API_URL);
    expect(secondPage.request.params.get('page')).toBe('1');
    secondPage.flush({ content: [LUIS], page: 1, size: 10, totalElements: 25, totalPages: 3 });
    fixture.detectChanges();

    fixture.componentInstance.onSearch('  ana  ');
    const search = httpMock.expectOne(req => req.method === 'GET' && req.url === API_URL);
    expect(search.request.params.get('page')).toBe('0');
    expect(search.request.params.get('search')).toBe('ana');
    search.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
    fixture.detectChanges();

    expect(element().textContent).toContain('Sin coincidencias');
  });

  it('applies the optimistic status change before the server responds', () => {
    initialRequest([ANA]);

    fixture.componentInstance.toggleStatus(fixture.componentInstance.users()[0]);

    expect(fixture.componentInstance.users()[0].enabled).toBeFalse();

    const request = httpMock.expectOne(req => req.method === 'PATCH' && req.url === `${API_URL}/${ANA.id}/status`);
    expect(request.request.body).toEqual({ enabled: false });
    request.flush({ ...ANA, enabled: false });
    fixture.detectChanges();

    expect(fixture.componentInstance.users()[0].enabled).toBeFalse();
    expect(fixture.componentInstance.isToggling(ANA.id)).toBeFalse();
    expect(fixture.componentInstance.actionError()).toBeNull();
  });

  it('rolls back the optimistic change when the API fails', () => {
    initialRequest([ANA]);

    fixture.componentInstance.toggleStatus(fixture.componentInstance.users()[0]);
    expect(fixture.componentInstance.users()[0].enabled).toBeFalse();

    const request = httpMock.expectOne(req => req.method === 'PATCH' && req.url === `${API_URL}/${ANA.id}/status`);
    request.flush(
      { flowCode: 'GEN-500', message: 'Falla del servidor.', traceId: 'trace-1' },
      { status: 500, statusText: 'Server Error' }
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.users()[0].enabled).toBeTrue();
    expect(fixture.componentInstance.isToggling(ANA.id)).toBeFalse();
    expect(fixture.componentInstance.actionError()?.flowCode).toBe('GEN-500');
    expect(element().textContent).toContain('Falla del servidor.');
  });

  it('opens the slide-over with the selected user for editing', () => {
    initialRequest([ANA]);

    fixture.componentInstance.openEdit(fixture.componentInstance.users()[0]);
    fixture.detectChanges();

    const panel = element().querySelector('aside') as HTMLElement;
    expect(panel.textContent).toContain('Editar usuario');
    expect((panel.querySelector('input[type="email"]') as HTMLInputElement).value).toBe('ana@empresa.com');
    expect(panel.textContent).toContain('Guardar cambios');
  });

  it('opens an empty form when creating a user', () => {
    initialRequest([ANA]);

    fixture.componentInstance.openCreate();
    fixture.detectChanges();

    const panel = element().querySelector('aside') as HTMLElement;
    expect(panel.textContent).toContain('Nuevo usuario');
    expect((panel.querySelector('input[type="email"]') as HTMLInputElement).value).toBe('');
    expect(panel.querySelector('input[type="password"]')).not.toBeNull();
    expect(panel.textContent).toContain('Crear usuario');
  });
});

describe('UserListComponent without ADMIN role', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            isAdmin: signal(false),
            user: signal<AuthUser | null>({ ...ADMIN_USER, roles: ['USER'] })
          }
        }
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('shows a restricted state without calling the API', () => {
    const fixture = TestBed.createComponent(UserListComponent);
    fixture.detectChanges();

    expect(httpMock.expectNone(API_URL)).toBeUndefined();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Acceso restringido');
    expect(fixture.componentInstance.loading()).toBeFalse();
  });
});
