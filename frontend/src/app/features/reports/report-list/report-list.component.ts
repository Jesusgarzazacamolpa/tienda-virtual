import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { finalize, Subscription } from 'rxjs';

import { AuthService } from '@core/auth/auth.service';
import { ApiError } from '@core/http/api-error';
import { ReportDefinition, ReportFormat } from '@core/reports/report.models';
import { ReportService } from '@core/reports/report.service';
import { EmptyStateComponent, SmartSearchComponent } from '@shared/components';

@Component({
  selector: 'app-report-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, SmartSearchComponent],
  templateUrl: './report-list.component.html'
})
export class ReportListComponent {
  private readonly reportService = inject(ReportService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private catalogSubscription: Subscription | null = null;
  private downloadSubscription: Subscription | null = null;

  readonly reports = signal<ReportDefinition[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly loadError = signal<ApiError | null>(null);
  readonly downloadError = signal<ApiError | null>(null);
  readonly downloadingKey = signal<string | null>(null);
  readonly lastDownload = signal<string | null>(null);

  readonly isAdmin = this.authService.isAdmin;

  constructor() {
    if (this.isAdmin()) {
      this.load();
    } else {
      this.loading.set(false);
    }

    this.destroyRef.onDestroy(() => {
      this.catalogSubscription?.unsubscribe();
      this.downloadSubscription?.unsubscribe();
    });
  }

  load(): void {
    if (!this.isAdmin()) {
      this.loading.set(false);
      return;
    }

    this.catalogSubscription?.unsubscribe();
    this.loading.set(true);
    this.loadError.set(null);

    this.catalogSubscription = this.reportService
      .catalog()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: reports => this.reports.set(reports),
        error: (apiError: ApiError) => {
          this.reports.set([]);
          this.loadError.set(apiError);
        }
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  download(report: ReportDefinition, format: ReportFormat): void {
    if (this.downloadingKey() !== null) {
      return;
    }

    this.downloadError.set(null);
    this.lastDownload.set(null);
    this.downloadingKey.set(`${report.code}:${format}`);

    this.downloadSubscription = this.reportService
      .download(report.code, format, this.searchTerm())
      .pipe(finalize(() => this.downloadingKey.set(null)))
      .subscribe({
        next: file => {
          saveBlob(file.blob, file.filename);
          this.lastDownload.set(file.filename);
        },
        error: (apiError: ApiError) => this.downloadError.set(apiError)
      });
  }

  isDownloading(report: ReportDefinition, format: ReportFormat): boolean {
    return this.downloadingKey() === `${report.code}:${format}`;
  }

  isBusy(): boolean {
    return this.downloadingKey() !== null;
  }

  formatLabel(format: ReportFormat): string {
    return format === 'pdf' ? 'PDF' : 'Excel (XLSX)';
  }
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
