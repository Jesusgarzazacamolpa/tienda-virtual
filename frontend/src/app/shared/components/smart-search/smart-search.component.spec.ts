import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SmartSearchComponent } from './smart-search.component';

describe('SmartSearchComponent', () => {
  let fixture: ComponentFixture<SmartSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SmartSearchComponent] });
    fixture = TestBed.createComponent(SmartSearchComponent);
    fixture.detectChanges();
  });

  function input(): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
  }

  it('emits only the latest value after the 300ms debounce', fakeAsync(() => {
    const emitted: string[] = [];
    fixture.componentInstance.searchChange.subscribe(value => emitted.push(value));

    input().value = 'a';
    input().dispatchEvent(new Event('input'));
    tick(150);

    input().value = 'ana';
    input().dispatchEvent(new Event('input'));
    tick(299);

    expect(emitted).toEqual([]);

    tick(1);
    expect(emitted).toEqual(['ana']);
  }));

  it('clears the value and emits immediately', fakeAsync(() => {
    const emitted: string[] = [];
    fixture.componentInstance.searchChange.subscribe(value => emitted.push(value));

    input().value = 'ana';
    input().dispatchEvent(new Event('input'));
    tick(300);
    fixture.detectChanges();

    const clearButton = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Limpiar búsqueda"]'
    ) as HTMLButtonElement;
    clearButton.click();
    fixture.detectChanges();

    expect(emitted).toEqual(['ana', '']);
    expect(input().value).toBe('');
  }));

  it('shows a spinner instead of the clear button while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('placeholder', 'Buscar usuarios');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(input().placeholder).toBe('Buscar usuarios');
    expect(element.querySelector('[role="status"]')).not.toBeNull();
    expect(element.querySelector('button')).toBeNull();
  });
});
