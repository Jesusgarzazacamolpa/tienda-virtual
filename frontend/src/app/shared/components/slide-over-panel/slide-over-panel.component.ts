import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';

@Component({
  selector: 'app-slide-over-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
  styles: `
    .panel-footer-slot:not(:has(> *)) {
      display: none;
    }
  `,
  templateUrl: './slide-over-panel.component.html'
})
export class SlideOverPanelComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly description = input<string | null>(null);
  readonly closed = output<void>();

  private previousOverflow: string | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      if (this.open()) {
        this.previousOverflow ??= document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return;
      }
      this.restoreOverflow();
    });

    destroyRef.onDestroy(() => this.restoreOverflow());
  }

  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  close(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  private restoreOverflow(): void {
    if (this.previousOverflow !== null) {
      document.body.style.overflow = this.previousOverflow;
      this.previousOverflow = null;
    }
  }
}
