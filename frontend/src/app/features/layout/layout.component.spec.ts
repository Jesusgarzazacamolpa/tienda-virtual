import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthUser } from '@core/auth/auth.models';
import { AuthService } from '@core/auth/auth.service';
import { LayoutComponent } from './layout.component';

const AUTH_USER: AuthUser = {
  id: '9b3f0f4c-8a40-4d8a-bf2c-2f6a1f1a8a11',
  email: 'admin@backoffice.local',
  firstName: 'Local',
  lastName: 'Admin',
  roles: ['ADMIN']
};

describe('LayoutComponent', () => {
  let fixture: ComponentFixture<LayoutComponent>;
  let router: Router;
  let logoutSpy: jasmine.Spy;
  let user = signal<AuthUser | null>(AUTH_USER);

  beforeEach(() => {
    user = signal<AuthUser | null>(AUTH_USER);
    logoutSpy = jasmine.createSpy('logout');

    TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user,
            roles: computed(() => user()?.roles ?? []),
            logout: logoutSpy
          }
        }
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the user identity and roles', () => {
    expect(element().textContent).toContain('Local Admin');
    expect(element().textContent).toContain('admin@backoffice.local');
    expect(element().textContent).toContain('LA');
    expect(element().textContent).toContain('ADMIN');
  });

  it('opens the mobile sidebar', () => {
    const aside = element().querySelector('aside') as HTMLElement;
    expect(aside.classList.contains('-translate-x-full')).toBeTrue();

    (element().querySelector('button[aria-label="Abrir menú"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.menuOpen()).toBeTrue();
    expect(aside.classList.contains('translate-x-0')).toBeTrue();
    expect(aside.classList.contains('-translate-x-full')).toBeFalse();
  });

  it('logs out and returns to login', () => {
    (element().querySelector('button[aria-label="Cerrar sesión"]') as HTMLButtonElement).click();

    expect(logoutSpy).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('falls back to a guest label without a session', () => {
    user.set(null);
    fixture.detectChanges();

    expect(element().textContent).toContain('Invitado');
    expect(element().textContent).not.toContain('admin@backoffice.local');
  });
});
