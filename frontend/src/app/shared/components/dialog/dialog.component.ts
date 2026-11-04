import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';

export type DialogSize = 'sm' | 'md' | 'lg';

let nextDialogId = 0;

@Component({
  selector: 'app-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(document:keydown)': 'onKeydown($event)'
  },
  styles: `
    .dialog-panel {
      animation: dialog-in 160ms ease-out;
    }

    .dialog-footer-slot:not(:has(> *)) {
      display: none;
    }

    @keyframes dialog-in {
      from {
        opacity: 0;
        transform: translateY(0.5rem) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .dialog-panel {
        animation: none;
      }
    }
  `,
  templateUrl: './dialog.component.html'
})
export class DialogComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly description = input<string | null>(null);
  readonly size = input<DialogSize>('md');
  readonly closeOnBackdrop = input(true);
  readonly closed = output<void>();

  protected readonly titleId = `dialog-title-${nextDialogId}`;
  protected readonly descriptionId = `dialog-description-${nextDialogId++}`;

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private previouslyFocused: HTMLElement | null = null;
  private previousOverflow: string | null = null;
  private focusTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.activate();
      } else {
        this.release();
      }
    });

    inject(DestroyRef).onDestroy(() => this.release());
  }

  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  onBackdrop(): void {
    if (this.closeOnBackdrop()) {
      this.close();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.open() || event.key !== 'Tab') {
      return;
    }

    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return;
    }

    const focusable = this.focusableElements(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  close(): void {
    if (this.open()) {
      this.closed.emit();
    }
  }

  private activate(): void {
    this.previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.previousOverflow ??= document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (this.focusTimer !== null) {
      clearTimeout(this.focusTimer);
    }

    this.focusTimer = setTimeout(() => {
      this.focusTimer = null;
      this.panel()?.nativeElement.focus({ preventScroll: true });
    });
  }

  private release(): void {
    if (this.focusTimer !== null) {
      clearTimeout(this.focusTimer);
      this.focusTimer = null;
    }

    if (this.previousOverflow !== null) {
      document.body.style.overflow = this.previousOverflow;
      this.previousOverflow = null;
    }

    const target = this.previouslyFocused;
    this.previouslyFocused = null;
    if (target?.isConnected) {
      target.focus({ preventScroll: true });
    }
  }

  private focusableElements(panel: HTMLElement): HTMLElement[] {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(panel.querySelectorAll<HTMLElement>(selector)).filter(element => element.offsetParent !== null);
  }
}
