import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormInputComponent } from './form-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormInputComponent],
  template: `
    <form [formGroup]="form">
      <app-form-input formControlName="email" label="Correo" type="email" hint="Usa tu correo corporativo" />
      <app-form-input formControlName="phone" label="Teléfono" mask="phone" />
    </form>
  `
})
class HostComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });
}

describe('FormInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fields(): { email: HTMLInputElement; phone: HTMLInputElement } {
    const [email, phone] = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('input')
    ) as HTMLInputElement[];
    return { email, phone };
  }

  function errorText(fieldIndex: number): string | null {
    const component = (fixture.nativeElement as HTMLElement).querySelectorAll('app-form-input')[fieldIndex];
    return component.querySelector('p')?.textContent?.trim() ?? null;
  }

  it('shows the required message once the control is touched', () => {
    expect(errorText(0)).toBe('Usa tu correo corporativo');

    host.form.controls.email.markAsTouched();
    fixture.detectChanges();

    expect(errorText(0)).toBe('Este campo es obligatorio.');
  });

  it('shows the email validation message for an invalid format', () => {
    host.form.controls.email.setValue('correo-invalido');
    host.form.controls.email.markAsTouched();
    fixture.detectChanges();

    expect(errorText(0)).toBe('Ingresa un correo electrónico válido.');
  });

  it('propagates typed values to the form control', () => {
    const { email } = fields();
    email.value = 'ana@empresa.com';
    email.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.form.controls.email.value).toBe('ana@empresa.com');
  });

  it('applies the phone mask while typing', () => {
    const { phone } = fields();
    phone.value = '5512345678';
    phone.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.form.controls.phone.value).toBe('551 234 5678');
    expect(phone.value).toBe('551 234 5678');
  });

  it('writes the control value into the input', () => {
    host.form.controls.email.setValue('admin@backoffice.local');
    fixture.detectChanges();

    expect(fields().email.value).toBe('admin@backoffice.local');
  });

  it('disables the native input when the control is disabled', () => {
    host.form.controls.email.disable();
    fixture.detectChanges();

    expect(fields().email.disabled).toBeTrue();
  });
});
