import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { DialogComponent } from './dialog.component';

@Component({
  standalone: true,
  imports: [DialogComponent],
  template: `
    <button type="button" (click)="isOpen.set(true)">Abrir diálogo</button>
    <app-dialog
      [open]="isOpen()"
      title="¿Descartar cambios?"
      description="Se perderán los ajustes sin guardar."
      size="sm"
      [closeOnBackdrop]="closeOnBackdrop"
      (closed)="isOpen.set(false)"
    >
      <p>Contenido del diálogo</p>
      <button type="button" dialogFooter (click)="isOpen.set(false)">Cancelar</button>
      <button type="button" dialogFooter (click)="isOpen.set(false)">Descartar</button>
    </app-dialog>
  `
})
class HostComponent {
  readonly isOpen = signal(false);
  closeOnBackdrop = true;
}

describe('DialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let trigger: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  function dialog(): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]');
  }

  function backdrop(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-dialog-backdrop]') as HTMLElement;
  }

  it('stays out of the DOM until open and exposes dialog semantics', () => {
    expect(dialog()).toBeNull();

    host.isOpen.set(true);
    fixture.detectChanges();

    const panel = dialog()!;
    expect(panel).not.toBeNull();
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('aria-labelledby')).toBeTruthy();
    expect(panel.getAttribute('aria-describedby')).toBeTruthy();
    expect(panel.textContent).toContain('¿Descartar cambios?');
    expect(panel.textContent).toContain('Contenido del diálogo');
    expect(panel.textContent).toContain('Descartar');
  });

  it('closes with Escape and with the close button', () => {
    host.isOpen.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(host.isOpen()).toBeFalse();
    expect(dialog()).toBeNull();

    host.isOpen.set(true);
    fixture.detectChanges();
    (dialog()!.querySelector('button[aria-label="Cerrar diálogo"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.isOpen()).toBeFalse();
  });

  it('closes on backdrop click unless closeOnBackdrop is disabled', () => {
    host.isOpen.set(true);
    fixture.detectChanges();

    backdrop().click();
    fixture.detectChanges();
    expect(host.isOpen()).toBeFalse();

    host.closeOnBackdrop = false;
    host.isOpen.set(true);
    fixture.detectChanges();

    backdrop().click();
    fixture.detectChanges();
    expect(host.isOpen()).toBeTrue();
  });

  it('locks the body scroll, focuses the panel and restores focus on close', fakeAsync(() => {
    document.body.style.overflow = 'auto';
    trigger.focus();

    host.isOpen.set(true);
    fixture.detectChanges();
    tick();

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.activeElement).toBe(dialog());

    host.isOpen.set(false);
    fixture.detectChanges();
    tick();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.activeElement).toBe(trigger);
  }));

  it('keeps Tab navigation inside the dialog', () => {
    host.isOpen.set(true);
    fixture.detectChanges();

    const buttons = Array.from(dialog()!.querySelectorAll('button')) as HTMLButtonElement[];
    const last = buttons[buttons.length - 1];

    last.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(document.activeElement).toBe(buttons[0]);

    buttons[0].focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
    expect(document.activeElement).toBe(last);
  });
});
