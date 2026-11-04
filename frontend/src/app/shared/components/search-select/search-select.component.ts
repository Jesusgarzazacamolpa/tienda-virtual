import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NgControl, ValidationErrors } from '@angular/forms';

export interface SearchSelectOption {
  value: string;
  label: string;
  description?: string;
}

let nextSelectId = 0;

@Component({
  selector: 'app-search-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)'
  },
  templateUrl: './search-select.component.html'
})
export class SearchSelectComponent implements ControlValueAccessor, OnInit {
  readonly options = input<SearchSelectOption[]>([]);
  readonly label = input('');
  readonly placeholder = input('Buscar…');
  readonly emptyText = input('Sin coincidencias.');
  readonly hint = input<string | null>(null);
  readonly required = input(false);
  readonly error = input<string | null>(null);
  readonly inputId = input(`search-select-${nextSelectId++}`);

  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly selectedValue = signal('');
  protected readonly disabled = signal(false);
  protected readonly isOpen = signal(false);
  private readonly query = signal('');
  private readonly activeIndex = signal(-1);
  private readonly state = signal<{ invalid: boolean; touched: boolean; errors: ValidationErrors | null }>({
    invalid: false,
    touched: false,
    errors: null
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  readonly selectedOption = computed(
    () => this.options().find(option => option.value === this.selectedValue()) ?? null
  );

  readonly filteredOptions = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (term.length === 0) {
      return this.options();
    }

    return this.options().filter(option =>
      [option.label, option.description ?? '', option.value].join(' ').toLowerCase().includes(term)
    );
  });

  readonly displayValue = computed(() =>
    this.isOpen() ? this.query() : (this.selectedOption()?.label ?? '')
  );

  readonly listId = computed(() => `${this.inputId()}-list`);
  readonly activeOptionId = computed(() =>
    this.isOpen() && this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null
  );
  readonly descriptionId = computed(() => `${this.inputId()}-description`);

  readonly showError = computed(() => {
    if (this.error()) {
      return true;
    }
    const state = this.state();
    return state.invalid && state.touched;
  });

  readonly message = computed(() => {
    if (this.error()) {
      return this.error();
    }
    return this.state().errors?.['required'] ? 'Este campo es obligatorio.' : null;
  });

  readonly inputClasses = computed(() => {
    const shared =
      'w-full rounded-lg border bg-slate-950/60 py-2 pl-3 pr-9 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60';
    const tone = this.showError()
      ? 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/30'
      : 'border-white/10 hover:border-white/20 focus:border-brand-400 focus:ring-brand-500/30';
    return `${shared} ${tone}`;
  });

  ngOnInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }

    this.syncState(control);
    control.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.syncState(control));
  }

  writeValue(value: unknown): void {
    this.selectedValue.set(value === null || value === undefined ? '' : String(value));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) {
      this.close();
    }
  }

  optionId(index: number): string {
    return `${this.inputId()}-option-${index}`;
  }

  optionClasses(index: number): string {
    const base = 'flex w-full flex-col gap-0.5 px-3 py-2 text-left transition';
    return index === this.activeIndex() ? `${base} bg-white/10` : `${base} hover:bg-white/5`;
  }

  onFocus(): void {
    if (this.disabled()) {
      return;
    }
    this.isOpen.set(true);
    this.query.set('');
    this.activeIndex.set(-1);
  }

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.isOpen.set(true);
    this.activeIndex.set(-1);
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen.set(true);
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.isOpen.set(true);
        this.moveActive(-1);
        break;
      case 'Enter': {
        if (!this.isOpen()) {
          return;
        }
        event.preventDefault();
        const option = this.filteredOptions()[this.activeIndex()];
        if (option) {
          this.select(option);
        }
        break;
      }
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Tab':
        if (this.isOpen()) {
          this.close();
        }
        break;
    }
  }

  onBlur(): void {
    if (this.disabled()) {
      return;
    }
    this.onTouched();
    this.close();
    this.syncState();
  }

  select(option: SearchSelectOption): void {
    if (this.disabled()) {
      return;
    }
    this.selectedValue.set(option.value);
    this.onChange(option.value);
    this.onTouched();
    this.close();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) {
      return;
    }
    if (event.target instanceof Node && this.elementRef.nativeElement.contains(event.target)) {
      return;
    }
    this.close();
  }

  private moveActive(delta: number): void {
    const options = this.filteredOptions();
    if (options.length === 0) {
      this.activeIndex.set(-1);
      return;
    }

    const next = this.activeIndex() + delta;
    if (next < 0) {
      this.activeIndex.set(options.length - 1);
    } else if (next >= options.length) {
      this.activeIndex.set(0);
    } else {
      this.activeIndex.set(next);
    }
  }

  private close(): void {
    this.isOpen.set(false);
    this.query.set('');
    this.activeIndex.set(-1);
  }

  private syncState(control: AbstractControl | null = this.ngControl?.control ?? null): void {
    if (!control) {
      return;
    }

    const next = { invalid: control.invalid, touched: control.touched, errors: control.errors };
    const current = this.state();
    if (current.invalid !== next.invalid || current.touched !== next.touched || current.errors !== next.errors) {
      this.state.set(next);
    }
  }
}
