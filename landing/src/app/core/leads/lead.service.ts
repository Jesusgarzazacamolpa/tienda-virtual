import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { LeadCreated, LeadPayload } from './lead.models';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);

  submit(payload: LeadPayload): Observable<LeadCreated> {
    return this.http.post<LeadCreated>(`${environment.apiBaseUrl}/leads`, payload);
  }
}
