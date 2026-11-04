import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-smart-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './smart-search.component.html'
})
export class SmartSearchComponent {
  readonly placeholder = input('Buscar…');
  readonly loading = input(false);
  readonly debounceMs = input(300);
  readonly searchChange = output<string>();

  readonly value = signal('');

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelTimer());
  }

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
    this.cancelTimer();
    this.timer = setTimeout(() => {
      this.timer = null;
      this.searchChange.emit(this.value());
    }, Math.max(0, this.debounceMs()));
  }

  clear(): void {
    this.cancelTimer();
    this.value.set('');
    this.searchChange.emit('');
    this.inputRef().nativeElement.focus();
  }

  private cancelTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
