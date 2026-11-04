import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api.config';
import { PageResponse } from '@core/http/page-response';
import { CreateUserRequest, UpdateUserRequest, User } from './user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  list(search: string, page: number, size: number): Observable<PageResponse<User>> {
    let params = new HttpParams().set('page', page).set('size', size);
    const term = search.trim();
    if (term) {
      params = params.set('search', term);
    }
    return this.http.get<PageResponse<User>>(`${this.apiBaseUrl}/users`, { params });
  }

  create(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiBaseUrl}/users`, request);
  }

  update(id: string, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiBaseUrl}/users/${id}`, request);
  }

  updateStatus(id: string, enabled: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiBaseUrl}/users/${id}/status`, { enabled });
  }
}
