import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { errorInterceptor } from '@core/http/error.interceptor';
import { User } from '@core/users/user.models';
import { UserFormComponent } from './user-form.component';

const API_URL = 'http://localhost:8080/api/v1/users';

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

describe('UserFormComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function create(user: User | null = null): {
    component: UserFormComponent;
    fixture: ComponentFixture<UserFormComponent>;
  } {
    const fixture = TestBed.createComponent(UserFormComponent);
    if (user) {
      fixture.componentRef.setInput('user', user);
    }
    fixture.detectChanges();
    return { component: fixture.componentInstance, fixture };
  }

  function fillValidCreateForm(component: UserFormComponent): void {
    component.form.setValue({
      firstName: ' Ana ',
      lastName: '   ',
      email: ' ana@empresa.com ',
      password: 'Secret123!',
      roles: ['USER']
    });
  }

  it('blocks submit while the client-side form is invalid', () => {
    const { component, fixture } = create();
    component.form.setValue({ firstName: '', lastName: '', email: 'no-es-email', password: 'corta', roles: [] });

    component.save();
    fixture.detectChanges();

    expect(component.form.invalid).toBeTrue();
    expect(httpMock.match(() => true).length).toBe(0);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Este campo es obligatorio.');
  });

  it('creates a user with trimmed values and a null optional last name', () => {
    const { component } = create();
    let savedUser: User | undefined;
    component.saved.subscribe(user => (savedUser = user));
    fillValidCreateForm(component);

    component.save();

    const request = httpMock.expectOne(API_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'ana@empresa.com',
      firstName: 'Ana',
      lastName: null,
      password: 'Secret123!',
      roles: ['USER']
    });
    request.flush(ANA, { status: 201, statusText: 'Created' });

    expect(savedUser?.email).toBe('ana@empresa.com');
    expect(component.saving()).toBeFalse();
  });

  it('loads an existing user and updates it without a password', () => {
    const { component } = create(ANA);

    expect(component.isEdit()).toBeTrue();
    expect(component.form.controls.email.value).toBe('ana@empresa.com');
    expect(component.form.controls.password.disabled).toBeTrue();

    component.form.controls.firstName.setValue('Ana María');
    component.save();

    const request = httpMock.expectOne(`${API_URL}/${ANA.id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      email: 'ana@empresa.com',
      firstName: 'Ana María',
      lastName: 'López',
      roles: ['USER']
    });
    expect(request.request.body.password).toBeUndefined();
    request.flush({ ...ANA, firstName: 'Ana María' });
  });

  it('maps backend field details to the matching input', () => {
    const { component, fixture } = create();
    fillValidCreateForm(component);
    component.save();

    const request = httpMock.expectOne(API_URL);
    request.flush(
      {
        flowCode: 'VAL-001',
        message: 'Los datos enviados no son válidos.',
        traceId: 'trace-1',
        details: [{ field: 'email', message: 'El email ya está registrado.' }]
      },
      { status: 400, statusText: 'Bad Request' }
    );
    fixture.detectChanges();

    expect(component.error()?.flowCode).toBe('VAL-001');
    expect(component.serverError('email')).toBe('El email ya está registrado.');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('El email ya está registrado.');
  });

  it('maps an email conflict to the email field when there are no details', () => {
    const { component } = create();
    fillValidCreateForm(component);
    component.save();

    const request = httpMock.expectOne(API_URL);
    request.flush(
      { flowCode: 'RES-002', message: 'Ya existe un usuario con ese email.', traceId: 'trace-2', details: [] },
      { status: 409, statusText: 'Conflict' }
    );

    expect(component.serverError('email')).toBe('Ya existe un usuario con ese email.');
  });

  it('keeps roles in sync with the checkboxes', () => {
    const { component } = create();

    component.toggleRole('USER');
    expect(component.form.controls.roles.value).toEqual([]);
    expect(component.rolesInvalid()).toBeTrue();

    component.toggleRole('ADMIN');
    expect(component.form.controls.roles.value).toEqual(['ADMIN']);
    expect(component.rolesInvalid()).toBeFalse();
  });
});
