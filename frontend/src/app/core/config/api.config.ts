import { InjectionToken } from '@angular/core';

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api/v1';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => DEFAULT_API_BASE_URL
});
