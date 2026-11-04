import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from '@core/config/api.config';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const apiBaseUrl = inject(API_BASE_URL);
  const token = authService.token();

  const isApiRequest = request.url.startsWith(apiBaseUrl);
  const isAuthEndpoint = request.url.startsWith(`${apiBaseUrl}/auth/`);

  if (!token || !isApiRequest || isAuthEndpoint) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })
  );
};
