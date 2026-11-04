export type ReportFormat = 'pdf' | 'xlsx';

export interface ReportDefinition {
  code: string;
  title: string;
  description: string;
  formats: ReportFormat[];
}

export interface DownloadedReport {
  blob: Blob;
  filename: string;
}
