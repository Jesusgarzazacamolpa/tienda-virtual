import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { AuthUser } from '@core/auth/auth.models';
import { ApiError } from '@core/http/api-error';
import { LoginComponent } from './login.component';

const AUTH_USER: AuthUser = {
  id: '9b3f0f4c-8a40-4d8a-bf2c-2f6a1f1a8a11',
  email: 'admin@backoffice.local',
  firstName: 'Local',
  lastName: 'Admin',
  roles: ['ADMIN']
};

describe('LoginComponent', () => {
  let authenticated = signal(false);
  let loginSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;
  let redirectTo: string | null = null;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    authenticated = signal(false);
    redirectTo = null;
    loginSpy = jasmine.createSpy('login').and.returnValue(of(AUTH_USER));
    navigateSpy = jasmine.createSpy('navigateByUrl').and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: { isAuthenticated: authenticated, login: loginSpy } },
        { provide: Router, useValue: { navigateByUrl: navigateSpy } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: (): string | null => redirectTo } } }
        }
      ]
    }).compileComponents();
  });

  function createFixture(): LoginComponent {
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function fillValidCredentials(component: LoginComponent): void {
    component.form.setValue({ email: ' admin@backoffice.local ', password: 'Admin123!' });
  }

  it('does not call the API when the form is invalid', () => {
    const component = createFixture();
    component.form.setValue({ email: 'no-es-email', password: 'corta' });

    component.submit();

    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('trims the email and navigates after a successful login', () => {
    const component = createFixture();
    fillValidCredentials(component);

    component.submit();

    expect(loginSpy).toHaveBeenCalledWith({ email: 'admin@backoffice.local', password: 'Admin123!' });
    expect(navigateSpy).toHaveBeenCalledWith('/users');
  });

  it('honors a safe redirect target', () => {
    redirectTo = '/users?page=2';
    const component = createFixture();
    fillValidCredentials(component);

    component.submit();

    expect(navigateSpy).toHaveBeenCalledWith('/users?page=2');
  });

  it('ignores unsafe redirect targets', () => {
    redirectTo = '//evil.example.com';
    const component = createFixture();
    fillValidCredentials(component);

    component.submit();

    expect(navigateSpy).toHaveBeenCalledWith('/users');
  });

  it('shows the API error message and stops the spinner', () => {
    loginSpy.and.returnValue(
      throwError(() => new ApiError('AUTH-001', 'Credenciales inválidas.', 'trace-1', 401))
    );
    const component = createFixture();
    fillValidCredentials(component);

    component.submit();
    fixture.detectChanges();

    expect(component.submitting()).toBeFalse();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Credenciales inválidas.');
  });

  it('redirects authenticated users away from the login page', () => {
    authenticated.set(true);

    createFixture();

    expect(navigateSpy).toHaveBeenCalledWith('/users');
  });
});
