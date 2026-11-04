import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('renderiza la propuesta de valor y todas las secciones', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Ingeniería de Software y Automatización para Operaciones Complejas.');
    expect(text).toContain('Garza Software Partners');
    expect(text).toContain('El músculo técnico detrás de tu negocio.');

    for (const id of ['inicio', 'soluciones', 'casos', 'stack', 'metodologia', 'contacto']) {
      expect(fixture.nativeElement.querySelector(`#${id}`)).withContext(id).not.toBeNull();
    }
  });

  it('incluye el formulario de evaluación con sus cuatro campos', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    expect(form).not.toBeNull();
    expect(form.querySelector('#lead-full-name')).not.toBeNull();
    expect(form.querySelector('#lead-email')).not.toBeNull();
    expect(form.querySelector('#lead-company')).not.toBeNull();
    expect(form.querySelector('#lead-challenge')).not.toBeNull();
    expect(form.querySelector('button[type="submit"]')?.textContent).toContain('Solicitar Evaluación');
  });
});
