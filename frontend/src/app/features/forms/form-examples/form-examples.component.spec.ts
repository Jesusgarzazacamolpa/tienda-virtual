import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { FormExamplesComponent } from './form-examples.component';

describe('FormExamplesComponent', () => {
  let component: FormExamplesComponent;
  let fixture: ComponentFixture<FormExamplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormExamplesComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormExamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidClient(): void {
    component.clientForm.setValue({
      companyName: ' Acme ',
      contactName: 'Ana López',
      email: ' ana@acme.com ',
      phone: '555 123 4567',
      employees: '25',
      industry: 'technology',
      owner: 'luis',
      website: 'https://acme.com',
      notes: 'Cliente nuevo.',
      notifications: true
    });
  }

  it('renders the form examples', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Alta de cliente');
    expect(text).toContain('Invitación de usuario');
    expect(text).toContain('Preferencias de notificación');
    expect(text).toContain('Carga de información');
    expect(text).toContain('Diálogo de confirmación');
  });

  it('filters the directory and patches the form with the selected company', () => {
    component.onCompanySearch('acme');
    fixture.detectChanges();

    expect(component.companyResults().map(company => company.companyName)).toEqual(['Acme Soluciones']);

    component.applyCompany(component.companyResults()[0]);
    fixture.detectChanges();

    expect(component.clientForm.getRawValue()).toEqual(
      jasmine.objectContaining({
        companyName: 'Acme Soluciones',
        contactName: 'Ana López',
        email: 'ana@acme.com',
        phone: '818 123 4567',
        employees: '25',
        industry: 'technology'
      })
    );
    expect(component.companyApplied()).toBe('Acme Soluciones');
    expect(component.companyResults()).toEqual([]);
    expect(component.companyResultsOpen()).toBeFalse();
  });

  it('closes the results on outside click and Escape', () => {
    component.onCompanySearch('a');
    expect(component.companyResultsOpen()).toBeTrue();

    component.onDocumentClick(new MouseEvent('click'));
    expect(component.companyResultsOpen()).toBeFalse();

    component.onCompanySearch('a');
    component.onEscape();

    expect(component.companyResultsOpen()).toBeFalse();
    expect(component.companyQuery()).toBe('');
  });

  it('does not simulate a save when the client form is invalid', () => {
    component.submitClient();
    fixture.detectChanges();

    expect(component.clientSaving()).toBeFalse();
    expect(component.clientSaved()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Este campo es obligatorio.');
  });

  it('normalizes the input and exposes the client summary after saving', fakeAsync(() => {
    fillValidClient();

    component.submitClient();
    expect(component.clientSaving()).toBeTrue();

    tick(600);
    fixture.detectChanges();

    expect(component.clientSaving()).toBeFalse();
    expect(component.clientSaved()).toEqual({
      company: 'Acme',
      contact: 'Ana López',
      email: 'ana@acme.com',
      industry: 'Tecnología',
      owner: 'Luis Ramírez',
      employees: '25',
      notifications: true,
      logo: 'Sin archivo'
    });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Cliente listo para enviar');
  }));

  it('opens and confirms the generic dialog', () => {
    component.openDialog();
    fixture.detectChanges();

    expect(component.dialogOpen()).toBeTrue();
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('¿Eliminar la plantilla?');

    component.closeDialog();
    fixture.detectChanges();

    expect(component.dialogOpen()).toBeFalse();
    expect(component.dialogConfirmed()).toBeFalse();

    component.openDialog();
    component.confirmDialog();
    fixture.detectChanges();

    expect(component.dialogOpen()).toBeFalse();
    expect(component.dialogConfirmed()).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Plantilla eliminada (simulación)');
  });

  it('shows the skeleton while the member load is simulated', fakeAsync(() => {
    component.simulateMembersLoad();
    fixture.detectChanges();

    expect(component.membersLoading()).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Hace 5 min');

    tick(1200);
    fixture.detectChanges();

    expect(component.membersLoading()).toBeFalse();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Hace 5 min');
  }));
});
