import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { LeadService } from '../../../../core/leads/lead.service';
import { LeadFormComponent } from './lead-form.component';

describe('LeadFormComponent', () => {
  let fixture: ComponentFixture<LeadFormComponent>;
  let component: LeadFormComponent;
  let leadService: jasmine.SpyObj<LeadService>;

  beforeEach(async () => {
    leadService = jasmine.createSpyObj<LeadService>('LeadService', ['submit']);
    leadService.submit.and.returnValue(of({ id: 'lead-1', createdAt: '2026-11-03T10:00:00Z' }));

    await TestBed.configureTestingModule({
      imports: [LeadFormComponent],
      providers: [{ provide: LeadService, useValue: leadService }]
    }).compileComponents();

    fixture = TestBed.createComponent(LeadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValid(values: Partial<Record<'fullName' | 'email' | 'company' | 'challenge', string>> = {}) {
    component.form.patchValue({
      fullName: 'Ana López',
      email: 'ana@garza.com.mx',
      company: 'Grupo Bajío',
      challenge: 'INTEGRATIONS',
      ...values
    });
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('rechaza correos gratuitos sin llamar al backend', () => {
    fillValid({ email: 'ana@gmail.com' });

    component.onSubmit();
    fixture.detectChanges();

    expect(leadService.submit).not.toHaveBeenCalled();
    expect(component.form.controls.email.hasError('corporateEmail')).toBeTrue();
    expect(text()).toContain('Usa tu correo corporativo (no Gmail, Hotmail, etc.).');
  });

  it('marca todos los campos obligatorios al enviar vacío', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(leadService.submit).not.toHaveBeenCalled();
    expect(text()).toContain('Escribe tu nombre completo.');
    expect(text()).toContain('Escribe tu correo corporativo.');
    expect(text()).toContain('Escribe el nombre de tu empresa.');
    expect(text()).toContain('Selecciona un desafío.');
  });

  it('envía el lead normalizado y muestra la confirmación', () => {
    fillValid({ email: 'ANA@Garza.COM.MX' });

    component.onSubmit();
    fixture.detectChanges();

    expect(leadService.submit).toHaveBeenCalledWith({
      fullName: 'Ana López',
      email: 'ana@garza.com.mx',
      company: 'Grupo Bajío',
      challenge: 'INTEGRATIONS',
      website: ''
    });
    expect(text()).toContain('Solicitud recibida, Ana.');
    expect(component.submitted()).toBeTrue();
    expect(component.form.controls.email.value).toBe('');
  });

  it('muestra el mensaje y folio que devuelve el backend', () => {
    leadService.submit.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'Los datos enviados no son válidos.', traceId: 'trace-123' }
          })
      )
    );
    fillValid();

    component.onSubmit();
    fixture.detectChanges();

    expect(text()).toContain('Los datos enviados no son válidos.');
    expect(text()).toContain('Folio: trace-123');
    expect(component.submitted()).toBeFalse();
  });

  it('explica el fallo de conexión cuando no hay respuesta', () => {
    leadService.submit.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    fillValid();

    component.onSubmit();
    fixture.detectChanges();

    expect(text()).toContain('No pudimos conectar con el servidor.');
  });

  it('permite enviar otra solicitud después del éxito', () => {
    fillValid();
    component.onSubmit();
    fixture.detectChanges();

    const button = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find(candidate => candidate.textContent?.includes('Enviar otra solicitud'));
    button?.click();
    fixture.detectChanges();

    expect(component.submitted()).toBeFalse();
    expect(text()).toContain('Solicitar Evaluación');
  });
});
