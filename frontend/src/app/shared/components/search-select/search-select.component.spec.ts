import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SearchSelectComponent, SearchSelectOption } from './search-select.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SearchSelectComponent],
  template: `
    <div [formGroup]="form">
      <app-search-select
        label="Ejecutivo de cuenta"
        formControlName="owner"
        [options]="options"
        [required]="true"
        placeholder="Buscar ejecutivo"
        hint="Escribe para filtrar el equipo."
      />
    </div>
  `
})
class HostComponent {
  private readonly formBuilder = new FormBuilder();

  readonly options: SearchSelectOption[] = [
    { value: 'ana', label: 'Ana López', description: 'Monterrey' },
    { value: 'luis', label: 'Luis Ramírez', description: 'Ciudad de México' },
    { value: 'sofia', label: 'Sofía Herrera', description: 'Querétaro' }
  ];

  readonly form = this.formBuilder.nonNullable.group({ owner: ['', Validators.required] });
}

describe('SearchSelectComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
  }

  function options(): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[role="option"]'));
  }

  function type(value: string): void {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('opens on focus and filters the options with the typed text', () => {
    input().focus();
    fixture.detectChanges();

    expect(options().length).toBe(3);

    type('luis');

    expect(options().length).toBe(1);
    expect(options()[0].textContent).toContain('Luis Ramírez');
  });

  it('selects an option with the mouse and updates the form control', () => {
    input().focus();
    fixture.detectChanges();

    options()[1].click();
    fixture.detectChanges();

    expect(host.form.controls.owner.value).toBe('luis');
    expect(host.form.controls.owner.valid).toBeTrue();
    expect(input().value).toBe('Luis Ramírez');
    expect(options().length).toBe(0);
  });

  it('supports arrow navigation and Enter to select', () => {
    input().focus();
    fixture.detectChanges();

    const press = (key: string) => {
      input().dispatchEvent(new KeyboardEvent('keydown', { key }));
      fixture.detectChanges();
    };

    press('ArrowDown');
    press('ArrowDown');
    press('Enter');

    expect(host.form.controls.owner.value).toBe('luis');
  });

  it('shows the required error after blur and closes on outside click', () => {
    input().focus();
    fixture.detectChanges();
    expect(options().length).toBe(3);

    document.body.click();
    fixture.detectChanges();
    expect(options().length).toBe(0);

    input().focus();
    fixture.detectChanges();
    input().blur();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Este campo es obligatorio.');
  });
});
