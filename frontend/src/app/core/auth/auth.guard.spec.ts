import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authenticated = signal(false);

  beforeEach(() => {
    authenticated = signal(false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated: authenticated } }]
    });
  });

  function runGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/users' } as RouterStateSnapshot)
    ) as boolean | UrlTree;
  }

  it('allows navigation when there is an active session', () => {
    authenticated.set(true);

    expect(runGuard()).toBeTrue();
  });

  it('redirects to login with the requested URL when unauthenticated', () => {
    const result = runGuard();
    const router = TestBed.inject(Router);

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?redirectTo=%2Fusers');
  });
});
