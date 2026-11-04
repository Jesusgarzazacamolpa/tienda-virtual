import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-file-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-uploader.component.html'
})
export class FileUploaderComponent {
  readonly accept = input<string[]>([]);
  readonly maxSizeMb = input(5);
  readonly multiple = input(false);
  readonly title = input('Arrastra y suelta tus archivos');
  readonly hint = input<string | null>(null);
  readonly filesSelected = output<File[]>();

  readonly selectedFiles = signal<File[]>([]);
  readonly error = signal<string | null>(null);
  readonly dragActive = signal(false);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly acceptAttribute = computed(() => this.accept().join(','));

  readonly defaultHint = computed(() => {
    const formats = this.accept().length > 0 ? `Formatos: ${this.accept().join(', ')} · ` : '';
    return `${formats}Máximo ${this.maxSizeMb()} MB`;
  });

  readonly dropzoneClasses = computed(() => {
    if (this.dragActive()) {
      return 'border-brand-400 bg-brand-500/10';
    }
    if (this.error()) {
      return 'border-rose-500/40 bg-rose-500/5 hover:border-rose-400';
    }
    return 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60';
  });

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    this.handleFiles(event.dataTransfer?.files ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
  }

  openPicker(): void {
    this.fileInput().nativeElement.click();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFiles(input.files);
    input.value = '';
  }

  handleFiles(files: FileList | null): void {
    if (!files || files.length === 0) {
      return;
    }

    const candidates = Array.from(files);
    const selected = this.multiple() ? candidates : candidates.slice(0, 1);
    const invalid = selected.find(file => !this.isAccepted(file) || !this.isWithinLimit(file));

    if (invalid) {
      this.error.set(this.describeError(invalid));
      return;
    }

    this.error.set(null);
    this.selectedFiles.set(selected);
    this.filesSelected.emit(selected);
  }

  removeFile(index: number): void {
    const remaining = this.selectedFiles().filter((_, position) => position !== index);
    this.selectedFiles.set(remaining);
    this.filesSelected.emit(remaining);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private isAccepted(file: File): boolean {
    const rules = this.accept();
    if (rules.length === 0) {
      return true;
    }

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    return rules.some(rule => {
      const normalized = rule.trim().toLowerCase();
      if (normalized.startsWith('.')) {
        return name.endsWith(normalized);
      }
      if (normalized.endsWith('/*')) {
        return type.startsWith(normalized.slice(0, -1));
      }
      return type === normalized;
    });
  }

  private isWithinLimit(file: File): boolean {
    return file.size <= this.maxSizeMb() * 1024 * 1024;
  }

  private describeError(file: File): string {
    if (!this.isWithinLimit(file)) {
      return `"${file.name}" supera el máximo de ${this.maxSizeMb()} MB.`;
    }
    return `"${file.name}" no tiene un formato permitido (${this.accept().join(', ')}).`;
  }
}
