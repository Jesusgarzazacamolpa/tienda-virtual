import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [EmptyStateComponent] });
    fixture = TestBed.createComponent(EmptyStateComponent);
  });

  it('renders the default message without an action button', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h3')?.textContent).toContain('No hay resultados');
    expect(element.querySelector('p')?.textContent).toContain('Aún no hay información');
    expect(element.querySelector('button')).toBeNull();
  });

  it('emits the action when the button is clicked', () => {
    fixture.componentRef.setInput('title', 'Sin usuarios');
    fixture.componentRef.setInput('actionLabel', 'Crear usuario');
    let emitted = false;
    fixture.componentInstance.action.subscribe(() => (emitted = true));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(emitted).toBeTrue();
  });
});
