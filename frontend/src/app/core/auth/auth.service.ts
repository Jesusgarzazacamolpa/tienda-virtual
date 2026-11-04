import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

import { API_BASE_URL } from '@core/config/api.config';
import { AuthSession, AuthUser, LoginCredentials, LoginResponse } from './auth.models';

const STORAGE_KEY = 'backoffice.session';
const MAX_TIMEOUT_MS = 2_147_483_647;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private readonly sessionState = signal<AuthSession | null>(this.restoreSession());
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  readonly session = this.sessionState.asReadonly();
  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly roles = computed(() => this.user()?.roles ?? []);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.roles().includes('ADMIN'));

  constructor() {
    this.scheduleExpiry(this.sessionState());
    inject(DestroyRef).onDestroy(() => this.clearExpiryTimer());
  }

  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, credentials).pipe(
      tap(response => this.startSession(response)),
      map(response => response.user)
    );
  }

  logout(): void {
    this.sessionState.set(null);
    this.clearExpiryTimer();
    this.removeStoredSession();
  }

  private startSession(response: LoginResponse): void {
    const session: AuthSession = {
      token: response.accessToken,
      expiresAt: Date.now() + response.expiresInSeconds * 1000,
      user: response.user
    };
    this.sessionState.set(session);
    this.persistSession(session);
    this.scheduleExpiry(session);
  }

  private scheduleExpiry(session: AuthSession | null): void {
    this.clearExpiryTimer();
    if (!session) {
      return;
    }

    const remaining = session.expiresAt - Date.now();
    if (remaining <= 0) {
      this.logout();
      return;
    }

    this.expiryTimer = setTimeout(() => this.logout(), Math.min(remaining, MAX_TIMEOUT_MS));
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer !== null) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private persistSession(session: AuthSession): void {
    this.storage()?.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private removeStoredSession(): void {
    this.storage()?.removeItem(STORAGE_KEY);
  }

  private restoreSession(): AuthSession | null {
    const raw = this.storage()?.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const session = JSON.parse(raw) as AuthSession;
      const isValid =
        typeof session?.token === 'string' &&
        typeof session.expiresAt === 'number' &&
        session.expiresAt > Date.now() &&
        Array.isArray(session.user?.roles);

      if (!isValid) {
        this.storage()?.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      this.storage()?.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private storage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }
}
