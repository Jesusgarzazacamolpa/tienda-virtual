import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '@core/config/api.config';
import { DownloadedReport, ReportDefinition, ReportFormat } from './report.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  catalog(): Observable<ReportDefinition[]> {
    return this.http.get<ReportDefinition[]>(`${this.apiBaseUrl}/reports`);
  }

  download(code: string, format: ReportFormat, search: string): Observable<DownloadedReport> {
    let params = new HttpParams().set('format', format);
    const term = search.trim();
    if (term) {
      params = params.set('search', term);
    }

    return this.http
      .get(`${this.apiBaseUrl}/reports/${encodeURIComponent(code)}`, {
        params,
        observe: 'response',
        responseType: 'blob'
      })
      .pipe(
        map(response => ({
          blob: response.body ?? new Blob(),
          filename: filenameFrom(response) ?? `${code}.${format}`
        }))
      );
  }
}

function filenameFrom(response: HttpResponse<Blob>): string | null {
  const disposition = response.headers.get('Content-Disposition');
  if (!disposition) {
    return null;
  }

  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (encoded) {
    return decodeURIComponent(encoded[1]);
  }

  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain ? plain[1] : null;
}
