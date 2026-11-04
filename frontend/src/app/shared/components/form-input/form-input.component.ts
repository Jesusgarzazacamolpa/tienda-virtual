import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, ControlValueAccessor, NgControl, ValidationErrors } from '@angular/forms';

export type FormInputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'search';
export type FormInputMask = 'none' | 'digits' | 'phone';

let nextInputId = 0;

@Component({
  selector: 'app-form-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-input.component.html'
})
export class FormInputComponent implements ControlValueAccessor, OnInit {
  readonly label = input('');
  readonly type = input<FormInputType>('text');
  readonly placeholder = input('');
  readonly hint = input<string | null>(null);
  readonly autocomplete = input('off');
  readonly mask = input<FormInputMask>('none');
  readonly required = input(false);
  readonly maxlength = input<number | null>(null);
  readonly error = input<string | null>(null);
  readonly inputId = input(`form-input-${nextInputId++}`);

  private readonly ngControl = inject(NgControl, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
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

  readonly showError = computed(() => {
    if (this.error()) {
      return true;
    }
    const state = this.state();
    return state.invalid && state.touched;
  });

  readonly message = computed(() => this.error() ?? this.validationMessage());

  readonly descriptionId = computed(() => `${this.inputId()}-description`);

  readonly inputClasses = computed(() => {
    const shared =
      'w-full rounded-lg border bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60';
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
    this.value.set(value === null || value === undefined ? '' : String(value));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    const masked = this.applyMask(element.value);
    if (element.value !== masked) {
      element.value = masked;
    }
    this.value.set(masked);
    this.onChange(masked);
    this.syncState();
  }

  onBlur(): void {
    this.onTouched();
    this.syncState();
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

  private validationMessage(): string | null {
    const errors = this.state().errors;
    if (!errors) {
      return null;
    }

    if (errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (errors['email']) {
      return 'Ingresa un correo electrónico válido.';
    }

    const minLength = errors['minlength'] as { requiredLength?: number } | undefined;
    if (minLength?.requiredLength) {
      return `Debe tener al menos ${minLength.requiredLength} caracteres.`;
    }

    const maxLength = errors['maxlength'] as { requiredLength?: number } | undefined;
    if (maxLength?.requiredLength) {
      return `Debe tener como máximo ${maxLength.requiredLength} caracteres.`;
    }

    if (errors['pattern']) {
      return 'El formato no es válido.';
    }
    if (errors['min']) {
      return 'El valor es demasiado bajo.';
    }
    if (errors['max']) {
      return 'El valor es demasiado alto.';
    }
    return 'Revisa este campo.';
  }

  private applyMask(raw: string): string {
    switch (this.mask()) {
      case 'digits':
        return raw.replace(/\D+/g, '');
      case 'phone': {
        const digits = raw.replace(/\D+/g, '').slice(0, 10);
        if (digits.length <= 3) {
          return digits;
        }
        if (digits.length <= 6) {
          return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      }
      default:
        return raw;
    }
  }
}
