import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideOverPanelComponent } from './slide-over-panel.component';

@Component({
  standalone: true,
  imports: [SlideOverPanelComponent],
  template: `
    <app-slide-over-panel
      [open]="open"
      title="Editar usuario"
      description="Actualiza los datos del usuario."
      (closed)="closedCount = closedCount + 1"
    >
      <p class="panel-body">Contenido del formulario</p>
      <div panelFooter>
        <button type="button" class="save-button">Guardar cambios</button>
      </div>
    </app-slide-over-panel>
  `
})
class HostComponent {
  open = false;
  closedCount = 0;
}

@Component({
  standalone: true,
  imports: [SlideOverPanelComponent],
  template: `
    <app-slide-over-panel [open]="true" title="Sin footer">
      <p class="only-body">Solo contenido</p>
    </app-slide-over-panel>
  `
})
class NoFooterHostComponent {}

describe('SlideOverPanelComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  function element(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function aside(): HTMLElement {
    return element().querySelector('aside') as HTMLElement;
  }

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('is hidden and inert by default', () => {
    fixture.detectChanges();

    const root = element().querySelector('.fixed') as HTMLElement;
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(aside().classList.contains('translate-x-full')).toBeTrue();
    expect(aside().hasAttribute('inert')).toBeTrue();
    expect(document.body.style.overflow).toBe('');
  });

  it('renders the content and footer when open', () => {
    host.open = true;
    fixture.detectChanges();

    expect(aside().classList.contains('translate-x-full')).toBeFalse();
    expect(aside().hasAttribute('inert')).toBeFalse();
    expect(element().querySelector('.panel-body')?.textContent).toContain('Contenido del formulario');
    expect(element().querySelector('.save-button')?.textContent).toContain('Guardar cambios');
    expect(getComputedStyle(element().querySelector('footer') as HTMLElement).display).not.toBe('none');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('emits closed when the backdrop is clicked', () => {
    host.open = true;
    fixture.detectChanges();

    (aside().previousElementSibling as HTMLElement).click();

    expect(host.closedCount).toBe(1);
  });

  it('emits closed when the close button is clicked', () => {
    host.open = true;
    fixture.detectChanges();

    (element().querySelector('button[aria-label="Cerrar panel"]') as HTMLButtonElement).click();

    expect(host.closedCount).toBe(1);
  });

  it('emits closed on Escape only when open', () => {
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(host.closedCount).toBe(0);

    host.open = true;
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(host.closedCount).toBe(1);
  });

  it('hides the footer slot when no footer is projected', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [NoFooterHostComponent] });
    const withoutFooter = TestBed.createComponent(NoFooterHostComponent);
    withoutFooter.detectChanges();

    const footer = (withoutFooter.nativeElement as HTMLElement).querySelector('footer') as HTMLElement;
    expect(footer).not.toBeNull();
    expect(getComputedStyle(footer).display).toBe('none');
  });
});
